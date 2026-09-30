/**
 * track-worker.js — napell.space visitor telemetry collector (Cloudflare Worker)
 *
 * WHAT IT DOES
 *   POST /api/track   — receives beacons from js/main.js (pageview, outbound click)
 *                       and js/auth.js (login attempts on the Costs section).
 *                       Enriches each event with the visitor's real IP, country,
 *                       city, region, ASN and user agent (client JS cannot see these).
 *   GET  /api/stats   — ?key=STATS_KEY&day=YYYY-MM-DD&format=json|text
 *                       returns the aggregated day (or today, HKT) on the fly.
 *   GET  /api/test    — ?key=STATS_KEY  sends a test email (use this once after
 *                       deploying: FormSubmit emails an activation link first).
 *   Cron "0 0 * * *"  — 08:00 HKT daily: aggregates the previous HKT day and
 *                       emails the report to MAIL_TO.
 *
 * BINDINGS / SETTINGS (dashboard → Workers → Settings)
 *   KV namespace   : binding name TRACK
 *   Variables      : MAIL_TO  = erik.wong@napell.bio
 *                    STATS_KEY = <random secret of your own>
 *   Secret (optional): RESEND_KEY — if set, mail goes via Resend;
 *                    otherwise FormSubmit.co (free, no signup, but the very
 *                    first send triggers an activation email — click it once).
 *   Route          : napell.space/api/*   (zone: napell.space)
 *   Cron Triggers  : 0 0 * * *
 *
 * STORAGE LAYOUT (KV, TTL 8 days — enough for the daily cron, self-cleaning)
 *   e:<hktdate>:<ms>-<rand>  pageview / outbound events
 *   l:<hktdate>:<ms>-<rand>  login events
 * HKT date = UTC+8, so the report day matches Hong Kong calendar days.
 *
 * FREE-TIER NOTE: KV allows 1,000 writes/day — one write per beacon. Fine for
 * an investor site; if traffic grows, move events to D1.
 */

/* ── QR encoder (vendored, MIT) ───────────────────────────────────────────
   QR Code Generator for JavaScript — (c) 2009 Kazuhiko Arase, MIT licence.
   https://github.com/kazuhikoarase/qrcode-generator  (v1.4.4, UMD wrapper removed)
   Used by GET /api/qr to render investor access QR codes as PNG server-side. */

//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

const MAIL_FROM = 'napell.space telemetry <onboarding@resend.dev>';
const HKT = 8 * 3600 * 1000;

function hktDate(ms) {
  return new Date(ms + HKT).toISOString().slice(0, 10);
}

function clamp(v, n) {
  return typeof v === 'string' ? v.slice(0, n) : undefined;
}

function rand() {
  return Math.random().toString(36).slice(2, 10);
}

/* ─── Ingest ─── */

async function handleTrack(req, env, ctx) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response('bad json', { status: 400 });
  }
  if (!body || typeof body !== 'object') return new Response('bad body', { status: 400 });

  const now = Date.now();
  const cf = req.cf || {};
  const ev = {
    ts: now,
    ip: req.headers.get('cf-connecting-ip') || 'unknown',
    ua: clamp(req.headers.get('user-agent'), 180) || '',
    city: clamp(cf.city, 60) || '',
    region: clamp(cf.region, 60) || '',
    country: clamp(cf.country, 8) || '',
    asn: cf.asn ? String(cf.asn) + (cf.asOrganization ? ' ' + clamp(cf.asOrganization, 60) : '') : '',
    t: body.t === 'login' ? 'login' : body.t === 'out' ? 'out' : 'pv',
    p: clamp(body.p, 220),
    r: clamp(body.r, 320),
    u: clamp(body.u, 220),
    sid: clamp(body.sid, 48) || 'nosid',
    lang: clamp(body.lang, 8) || '',
    user: clamp(body.user, 60),
    ok: !!body.ok
  };

  const date = hktDate(now);
  const prefix = ev.t === 'login' ? 'l' : 'e';
  const key = `${prefix}:${date}:${now}-${rand()}`;
  await env.TRACK.put(key, JSON.stringify(ev), { expirationTtl: 8 * 86400 });

  // Admin logins are rare — alert immediately, don't wait for the daily digest
  if (ev.t === 'login') {
    ctx.waitUntil(sendMail(env,
      `[napell.space] Costs login ${ev.ok ? 'SUCCESS' : 'FAILED'} — ${ev.user || '?'}`,
      loginAlertText(ev)));
  }
  return new Response('ok');
}

/* ─── Aggregation ─── */

async function loadDay(env, date) {
  const rec = { date, pv: 0, out: 0, ips: {}, paths: {}, refs: {}, outUrls: {}, sessions: {}, logins: [], regs: [] };
  for (const prefix of ['e', 'l', 'r']) {
    let cursor;
    do {
      const page = await env.TRACK.list({ prefix: `${prefix}:${date}:`, cursor });
      cursor = page.list_complete ? undefined : page.cursor;
      for (const k of page.keys) {
        let ev;
        try { ev = JSON.parse(await env.TRACK.get(k.name)); } catch (e) { continue; }
        if (!ev) continue;
        if (prefix === 'l') { rec.logins.push(ev); continue; }
        if (prefix === 'r') { rec.regs.push(ev); continue; }
        if (ev.t === 'out') {
          rec.out += 1;
          rec.outUrls[ev.u || '?'] = (rec.outUrls[ev.u || '?'] || 0) + 1;
          continue;
        }
        rec.pv += 1;
        const ip = ev.ip || 'unknown';
        if (!rec.ips[ip]) {
          rec.ips[ip] = { views: 0, first: ev.ts, last: ev.ts, city: ev.city, region: ev.region, country: ev.country, asn: ev.asn, ua: ev.ua, sids: new Set() };
        }
        const o = rec.ips[ip];
        o.views += 1;
        o.first = Math.min(o.first, ev.ts);
        o.last = Math.max(o.last, ev.ts);
        if (ev.city) o.city = ev.city;
        if (ev.country) o.country = ev.country;
        o.sids.add(ev.sid);
        rec.paths[ev.p || '?'] = (rec.paths[ev.p || '?'] || 0) + 1;
        if (ev.r) rec.refs[ev.r] = (rec.refs[ev.r] || 0) + 1;
        if (!rec.sessions[ev.sid]) rec.sessions[ev.sid] = { ip, trail: [] };
        if (ev.p && rec.sessions[ev.sid].trail[rec.sessions[ev.sid].trail.length - 1] !== ev.p) {
          rec.sessions[ev.sid].trail.push(ev.p);
        }
      }
    } while (cursor);
  }
  rec.logins.sort((a, b) => a.ts - b.ts);
  return rec;
}

function topObj(obj, n) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function hhmm(ts) {
  return new Date(ts + HKT).toISOString().slice(11, 16);
}

function locationLabel(v) {
  return [v.city, v.region, v.country].filter(Boolean).join(', ') || 'unknown';
}

function buildReportText(rec) {
  const lines = [];
  lines.push(`napell.space daily report — ${rec.date} (HKT)`);
  lines.push(`Page views: ${rec.pv} · Unique IPs: ${Object.keys(rec.ips).length} · Sessions: ${Object.keys(rec.sessions).length} · Outbound clicks: ${rec.out} · Login events: ${rec.logins.length} · New registrations: ${rec.regs.length}`);
  lines.push('');

  lines.push('== VISITORS ==');
  const ips = Object.entries(rec.ips).sort((a, b) => b[1].views - a[1].views);
  for (const [ip, v] of ips) {
    lines.push(`${ip} · ${locationLabel(v)}${v.asn ? ' · ' + v.asn : ''} · ${v.views} views · ${hhmm(v.first)}–${hhmm(v.last)} · ${v.ua}`);
    for (const sid of v.sids) {
      const s = rec.sessions[sid];
      if (s && s.trail.length) lines.push(`     trail: ${s.trail.slice(0, 12).join(' → ')}${s.trail.length > 12 ? ' → …' : ''}`);
    }
  }
  if (!ips.length) lines.push('(no page views)');

  lines.push('', '== REFERRERS ==');
  const refs = topObj(rec.refs, 15);
  if (refs.length) for (const [r, n] of refs) lines.push(`${n}  ${r}`);
  else lines.push('(none recorded)');

  lines.push('', '== PAGES ==');
  for (const [p, n] of topObj(rec.paths, 20)) lines.push(`${n}  ${p}`);

  lines.push('', '== OUTBOUND CLICKS ==');
  const outs = topObj(rec.outUrls, 15);
  if (outs.length) for (const [u, n] of outs) lines.push(`${n}  ${u}`);
  else lines.push('(none)');

  lines.push('', '== COSTS LOGINS ==');
  if (rec.logins.length) {
    for (const l of rec.logins) {
      lines.push(`${hhmm(l.ts)}  ${l.user || '?'}  ${l.ok ? 'SUCCESS' : 'FAILED'}  ${l.ip} (${locationLabel(l)})`);
    }
  } else {
    lines.push('(none)');
  }

  lines.push('', '== NEW REGISTRATIONS ==');
  if (rec.regs.length) {
    for (const r of rec.regs) {
      lines.push(`${hhmm(r.ts)}  ${r.type}: ${r.id}  ${r.name || ''}  ${r.ip} (${locationLabel(r)})`);
    }
  } else {
    lines.push('(none)');
  }
  lines.push('', '— sent by the napell.space telemetry worker. Illustrative data; this mailbox receives one digest per day plus instant login alerts.');
  return lines.join('\n');
}

/* ─── Mail ─── */

async function sendMail(env, subject, text) {
  const to = env.MAIL_TO || 'erik.wong@napell.bio';
  try {
    if (env.RESEND_KEY) {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + env.RESEND_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, text })
      });
      return r.ok;
    }
    // FormSubmit: free, no signup. First-ever send makes FormSubmit email an
    // activation link to `to` — click it once and all later sends go through.
    // FormSubmit requires a Referer header (it must look like a web-page form),
    // so we present ourselves as the site.
    const r = await fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://www.napell.space/' },
      body: JSON.stringify({ _subject: subject, _template: 'box', Report: text })
    });
    sendMail.lastStatus = r.status;
    sendMail.lastBody = await r.text().catch(() => '');
    return r.ok;
  } catch (e) {
    sendMail.lastStatus = 'exception: ' + (e && e.message);
    return false;
  }
}

function loginAlertText(ev) {
  return [
    `Costs section login ${ev.ok ? 'SUCCESS' : 'FAILED'}`,
    ``,
    `time     : ${new Date(ev.ts + HKT).toISOString().replace('T', ' ').slice(0, 19)} HKT`,
    `user     : ${ev.user || '?'}`,
    `ip       : ${ev.ip}`,
    `location : ${locationLabel(ev)}`,
    `network  : ${ev.asn || 'n/a'}`,
    `agent    : ${ev.ua || 'n/a'}`,
    `page     : costs / riyadh admin gate`
  ].join('\n');
}

/* ─── Auth: registration & login for the Costs section ───
   Registers visitors by email / mobile / WeChat ID + password.
   Records live in KV (no TTL) as u:<type>:<id>; every registration
   triggers an instant email to the owner and is included in the daily
   digest. Legacy admin accounts (erik.wong / James) stay client-side. */

const AUTH_TYPES = ['email', 'mobile', 'wechat'];

function corsHeaders(req) {
  const origin = req.headers.get('origin') || '';
  const allow = /(^|\.)napell\.space$/.test((origin || '').replace(/^https?:\/\//, '').split('/')[0]) ? origin : '*';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function jsonCORS(obj, req, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(req) }
  });
}

function normId(type, id) {
  const v = (id || '').trim();
  if (!v) return '';
  return type === 'email' ? v.toLowerCase() : v.replace(/\s+/g, '');
}

/* Username (login-name) support: the optional name given at registration
   doubles as a login handle. Pointers live as n:<lowercased name> → {t,id}.
   Collisions are rejected at registration; legacy users are backfilled
   lazily on their next successful id-login. */
function unameKey(name) {
  return 'n:' + (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

async function resolveUser(env, id) {
  for (const t of AUTH_TYPES) {
    const raw = await env.TRACK.get(`u:${t}:${id}`);
    if (raw) return { hit: JSON.parse(raw), hitType: t, hitId: id };
  }
  // Not a registered ID — try it as a login name
  const ptr = await env.TRACK.get(unameKey(id));
  if (ptr) {
    try {
      const p = JSON.parse(ptr);
      if (p && p.t && p.id) {
        const raw = await env.TRACK.get(`u:${p.t}:${p.id}`);
        if (raw) return { hit: JSON.parse(raw), hitType: p.t, hitId: p.id };
      }
    } catch (e) { /* stale pointer — ignore */ }
  }
  return { hit: null, hitType: '', hitId: '' };
}

function enrich(req) {
  const cf = req.cf || {};
  return {
    ip: req.headers.get('cf-connecting-ip') || 'unknown',
    ua: clamp(req.headers.get('user-agent'), 180) || '',
    city: clamp(cf.city, 60) || '',
    region: clamp(cf.region, 60) || '',
    country: clamp(cf.country, 8) || '',
    asn: cf.asn ? String(cf.asn) + (cf.asOrganization ? ' ' + clamp(cf.asOrganization, 60) : '') : ''
  };
}

async function handleRegister(req, env, ctx) {
  let body;
  try { body = await req.json(); } catch (e) { return jsonCORS({ ok: false, error: 'bad json' }, req, 400); }
  const type = AUTH_TYPES.includes(body.type) ? body.type : '';
  const id = normId(type, body.id);
  const name = clamp(body.name, 60) || '';
  const pass = typeof body.pass === 'string' ? body.pass : '';
  if (!type || !id || !pass) return jsonCORS({ ok: false, error: 'missing fields' }, req, 400);
  if (pass.length < 6 || pass.length > 72) return jsonCORS({ ok: false, error: 'bad password length' }, req, 400);

  // Rough per-IP daily rate limit: max 20 registrations / logins per day per IP
  const now = Date.now();
  const date = hktDate(now);
  const rlKey = `rl:${date}:${req.headers.get('cf-connecting-ip') || 'unknown'}`;
  const count = parseInt((await env.TRACK.get(rlKey)) || '0', 10);
  if (count >= 20) return jsonCORS({ ok: false, error: 'rate limited' }, req, 429);
  ctx.waitUntil(env.TRACK.put(rlKey, String(count + 1), { expirationTtl: 2 * 86400 }));

  const key = `u:${type}:${id}`;
  const existing = await env.TRACK.get(key);
  if (existing) return jsonCORS({ ok: false, error: 'exists' }, req, 200);

  // Reserve the login name (if given) and refuse duplicates
  let nkey = '';
  if (name) {
    nkey = unameKey(name);
    const taken = await env.TRACK.get(nkey);
    if (taken) return jsonCORS({ ok: false, error: 'name_taken' }, req, 200);
  }

  const salt = rand() + rand();
  const rec = {
    type, id, name,
    salt,
    hash: await sha256hex(salt + ':' + pass),
    created: now,
    lastLogin: null,
    ips: [],
    ...enrich(req)
  };
  await env.TRACK.put(key, JSON.stringify(rec));
  if (nkey) await env.TRACK.put(nkey, JSON.stringify({ t: type, id }));
  // Registration event for the daily digest (30-day TTL)
  const regEv = { ts: now, t: 'reg', type, id, name, ...enrich(req) };
  await env.TRACK.put(`r:${date}:${now}-${rand()}`, JSON.stringify(regEv), { expirationTtl: 30 * 86400 });

  // Instant email to the owner
  ctx.waitUntil(sendMail(env,
    `[napell.space] New registration — ${type}: ${id}`,
    [
      `New Costs registration`,
      ``,
      `method   : ${type}`,
      `account  : ${id}`,
      `name     : ${name || '(not given)'}`,
      `time     : ${new Date(now + HKT).toISOString().replace('T', ' ').slice(0, 19)} HKT`,
      `ip       : ${regEv.ip}`,
      `location : ${locationLabel(regEv)}`,
      `network  : ${regEv.asn || 'n/a'}`,
      `agent    : ${regEv.ua || 'n/a'}`,
      ``
    ].join('\n')));

  return jsonCORS({ ok: true, type, name }, req);
}

async function handleLogin(req, env, ctx) {
  let body;
  try { body = await req.json(); } catch (e) { return jsonCORS({ ok: false, error: 'bad json' }, req, 400); }
  const pass = typeof body.pass === 'string' ? body.pass : '';
  const id = (body.id || '').trim().toLowerCase();
  if (!id || !pass) return jsonCORS({ ok: false }, req);

  const now = Date.now();
  const date = hktDate(now);
  const rlKey = `rl:${date}:${req.headers.get('cf-connecting-ip') || 'unknown'}`;
  const count = parseInt((await env.TRACK.get(rlKey)) || '0', 10);
  if (count >= 20) return jsonCORS({ ok: false, error: 'rate limited' }, req, 429);
  ctx.waitUntil(env.TRACK.put(rlKey, String(count + 1), { expirationTtl: 2 * 86400 }));

  const { hit, hitType, hitId } = await resolveUser(env, id);
  if (!hit) return jsonCORS({ ok: false }, req);
  const ok = (await sha256hex(hit.salt + ':' + pass)) === hit.hash;
  if (ok) {
    hit.lastLogin = now;
    const e = enrich(req);
    hit.ips = [...new Set([...(hit.ips || []), e.ip])].slice(-10);
    hit.lastCity = e.city; hit.lastCountry = e.country;
    await env.TRACK.put(`u:${hitType}:${hitId}`, JSON.stringify(hit));
    // Backfill the login-name pointer for users registered before usernames existed
    if (hit.name && !(await env.TRACK.get(unameKey(hit.name)))) {
      await env.TRACK.put(unameKey(hit.name), JSON.stringify({ t: hitType, id: hitId }));
    }
    // Login event — joins the daily report and the instant TRACK alert
    await env.TRACK.put(`l:${date}:${now}-${rand()}`,
      JSON.stringify({ ts: now, t: 'login', user: hitId, ok: true, ...e }), { expirationTtl: 8 * 86400 });
  }
  return jsonCORS({ ok, name: ok ? hit.name || '' : '' }, req);
}

/* Member door — registered Costs users (u:<type>:<id> in TRACK) get site
   access with their existing ID + password. Success mints the same signed
   session cookie as a QR scan, so no token is consumed. */
async function handleDoorLogin(req, env, ctx) {
  let body;
  try { body = await req.json(); } catch (e) { return json({ ok: false }, 400); }
  const pass = typeof body.pass === 'string' ? body.pass : '';
  const id = (body.id || '').trim().toLowerCase();
  if (!id || !pass) return json({ ok: false }, 400);

  const now = Date.now();
  const date = hktDate(now);
  const rlKey = `rl:${date}:${req.headers.get('cf-connecting-ip') || 'unknown'}`;
  const count = parseInt((await env.TRACK.get(rlKey)) || '0', 10);
  if (count >= 20) return json({ ok: false, error: 'rate limited' }, 429);
  ctx.waitUntil(env.TRACK.put(rlKey, String(count + 1), { expirationTtl: 2 * 86400 }));

  const { hit, hitType, hitId } = await resolveUser(env, id);
  if (!hit) return json({ ok: false });
  const ok = (await sha256hex(hit.salt + ':' + pass)) === hit.hash;
  if (!ok) return json({ ok: false });

  hit.lastLogin = now;
  const e = enrich(req);
  hit.ips = [...new Set([...(hit.ips || []), e.ip])].slice(-10);
  hit.lastCity = e.city; hit.lastCountry = e.country;
  ctx.waitUntil(env.TRACK.put(`u:${hitType}:${hitId}`, JSON.stringify(hit)));
  if (hit.name) {
    ctx.waitUntil(env.TRACK.get(unameKey(hit.name)).then((v) => {
      if (!v) return env.TRACK.put(unameKey(hit.name), JSON.stringify({ t: hitType, id: hitId }));
    }));
  }
  ctx.waitUntil(env.TRACK.put(`l:${date}:${now}-${rand()}`,
    JSON.stringify({ ts: now, t: 'login', user: hitId, ok: true, door: true, ...e }), { expirationTtl: 8 * 86400 }));

  const sid = (await sha256hex(String(Date.now()) + hitId + rand() + rand())).slice(0, 32);
  return new Response(JSON.stringify({ ok: true, name: hit.name || '' }), {
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': await sessionCookie(env, sid, Date.now() + SITE_TTL) }
  });
}

async function handleUsers(env, url) {
  const users = [];
  let cursor;
  do {
    const page = await env.TRACK.list({ prefix: 'u:', cursor });
    cursor = page.list_complete ? undefined : page.cursor;
    for (const k of page.keys) {
      try {
        const rec = JSON.parse(await env.TRACK.get(k.name));
        users.push({ type: rec.type, id: rec.id, name: rec.name, created: rec.created, lastLogin: rec.lastLogin, ips: rec.ips, lastCity: rec.lastCity, lastCountry: rec.lastCountry });
      } catch (e) { /* skip */ }
    }
  } while (cursor);
  if (url.searchParams.get('format') === 'text') {
    const lines = users.map((u) =>
      `${u.type.padEnd(7)} ${u.id}  ${u.name || ''}  created ${new Date(u.created + HKT).toISOString().slice(0, 10)}  lastLogin ${u.lastLogin ? new Date(u.lastLogin + HKT).toISOString().replace('T', ' ').slice(0, 16) : 'never'}  ${[u.lastCity, u.lastCountry].filter(Boolean).join(', ')}`);
    return new Response(lines.join('\n') || '(no users yet)', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return json(users);
}

/* ─── QR-gated site access (Option C: sliding TTL + leave-kill with grace) ───
   www.napell.space/* is served by this worker from the SITE KV mirror.
   Entry only via one-time QR tokens: /access?t=TOKEN burns the token and
   sets a signed session cookie (60-min sliding idle window). Leaving the
   site (pagehide without an internal link click) schedules the session's
   death after a 45s grace — a reload cancels the pending kill. */

const SITE_TTL = 60 * 60 * 1000;   // sliding idle window
const SITE_GRACE = 45 * 1000;      // grace before a "leave" becomes final

/* Gate page — branded, tri-lingual (EN / 中文 / العربية, RTL aware).
   Layout: language pills → brand → confidential status → request channels.
   kind: 'private' | 'used' | 'ended' | 'invalid' */
function gatePage(kind) {
  return new Response(`<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Private access — napell.space</title>
<style>
  * { box-sizing:border-box; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#000; color:#e7e9ea; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Noto Sans Arabic",sans-serif; }
  .frame { position:relative; max-width:440px; width:calc(100% - 48px); margin:32px 0; padding:38px 30px 30px;
           border:1px solid #282c30; outline:1px solid #1a1d20; outline-offset:5px; text-align:center; }
  .langs { position:absolute; top:12px; right:14px; display:flex; gap:6px; }
  .langs button { background:none; border:1px solid #2f3336; color:#71767b; font-size:11px; padding:3px 9px;
                  border-radius:999px; cursor:pointer; font-family:inherit; }
  .langs button.on { border-color:#1d9bf0; color:#1d9bf0; }
  .lock { width:50px; height:50px; margin:6px auto 18px; border:1px solid #2f3336; border-radius:14px;
          display:flex; align-items:center; justify-content:center; color:#1d9bf0; }
  .brand h1 { font-size:26px; letter-spacing:.14em; margin:0; font-weight:700; }
  .brand .sub { font-size:11px; letter-spacing:.26em; color:#71767b; margin-top:5px; }
  .rule { width:64px; height:2px; background:#1d9bf0; margin:22px auto; }
  .status .tag { font-size:13px; letter-spacing:.24em; color:#1d9bf0; font-weight:700; }
  .status h2 { font-size:19px; margin:8px 0 8px; font-weight:600; }
  .status p { font-size:13.5px; color:#71767b; line-height:1.65; margin:0 auto; max-width:330px; }
  .req { margin-top:26px; padding-top:22px; border-top:1px solid #282c30; }
  .req .hd { font-size:13px; font-weight:600; margin-bottom:4px; }
  .req .sub { font-size:12px; color:#71767b; margin-bottom:14px; }
  .ch { display:flex; flex-direction:column; gap:8px; }
  .ch a, .ch button { display:flex; align-items:center; gap:11px; padding:10px 14px; text-decoration:none;
        border:1px solid #2f3336; border-radius:10px; color:#e7e9ea; font-size:13.5px; font-family:inherit;
        background:none; cursor:pointer; text-align:start; }
  .ch a:hover, .ch button:hover { border-color:#1d9bf0; }
  .ch .ic { width:20px; height:20px; flex:0 0 20px; color:#1d9bf0; }
  .ch .t { flex:1; }
  .ch .t b { display:block; font-size:13.5px; font-weight:600; }
  .ch .t span { display:block; font-size:11.5px; color:#71767b; margin-top:1px; direction:ltr; }
  .foot { margin-top:24px; font-size:10.5px; letter-spacing:.28em; color:#1d9bf0; text-transform:uppercase; }
  .copied { color:#00ba7c !important; }
  .mem { margin-top:14px; }
  .mem > button { background:none; border:none; color:#71767b; font-size:12px; font-family:inherit;
                  cursor:pointer; text-decoration:underline; text-underline-offset:3px; padding:2px; }
  .mem > button:hover { color:#1d9bf0; }
  .mem form { margin-top:10px; display:flex; flex-direction:column; gap:7px; }
  .mem input { background:#0a0d10; border:1px solid #2f3336; border-radius:8px; color:#e7e9ea;
               padding:9px 12px; font-size:13.5px; font-family:inherit; width:100%; }
  .mem input:focus { outline:none; border-color:#1d9bf0; }
  .mem form button { background:#1d9bf0; color:#fff; border:none; border-radius:8px; padding:9px;
                     font-size:13.5px; font-weight:600; font-family:inherit; cursor:pointer; }
  .mem form button:hover { background:#1a8cd8; }
  #m-err { font-size:12px; color:#f4212e; min-height:15px; }
  html[dir="rtl"] .langs { right:auto; left:14px; }
  html[dir="rtl"] .ch a, html[dir="rtl"] .ch button { text-align:end; }
</style></head><body>
<div class="frame">
  <div class="langs">
    <button data-l="en" class="on">EN</button><button data-l="zh">中文</button><button data-l="ar">ع</button>
  </div>
  <div class="lock"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
  <div class="brand"><h1>NAPELL</h1><div class="sub">SEEDLINGS · AEROPONIC COFFEE</div></div>
  <div class="rule"></div>
  <div class="status"><div class="tag" id="g-tag"></div><h2 id="g-title"></h2><p id="g-msg"></p></div>
  <div class="req">
    <div class="hd" id="g-rhd"></div>
    <div class="sub" id="g-rsub"></div>
    <div class="ch">
      <a id="c-wa" target="_blank" rel="noopener">
        <svg class="ic" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.2c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.5-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.4 1.8 2.2 1.2 1.1 2.3 1.4 2.6 1.6.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.3z"/></svg>
        <span class="t"><b>WhatsApp</b><span id="c-wa-n">+852 9318 8252</span></span>
      </a>
      <button id="c-wx" type="button">
        <svg class="ic" viewBox="0 0 24 24" fill="currentColor"><path d="M8.7 4C4.9 4 1.8 6.6 1.8 9.9c0 1.8 1 3.4 2.5 4.5l-.6 2 2.2-1.1c.6.2 1.3.3 2 .3h.4a5.5 5.5 0 0 1-.2-1.5c0-3.1 3-5.6 6.6-5.6h.4C14.5 6 11.9 4 8.7 4zM6.4 7.3c.5 0 .8.3.8.8s-.4.8-.8.8-.9-.4-.9-.8.4-.8.9-.8zm4.6 0c.5 0 .8.3.8.8s-.3.8-.8.8-.9-.4-.9-.8.4-.8.9-.8zM15.4 9.7c-3.2 0-5.8 2.2-5.8 4.9 0 2.7 2.6 4.9 5.8 4.9.6 0 1.2-.1 1.8-.3l1.9.9-.5-1.7c1.3-.9 2.1-2.3 2.1-3.8 0-2.7-2.6-4.9-5.8-4.9zm-2 2.5c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7zm4 0c.4 0 .7.3.7.7s-.3.7-.7.7-.7-.3-.7-.7.3-.7.7-.7z"/></svg>
        <span class="t"><b id="c-wx-l">WeChat</b><span id="c-wx-n">+86 158 0022 2338</span></span>
      </button>
      <a id="c-em">
        <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
        <span class="t"><b>Email</b><span id="c-em-n">erik.wong@napell.bio</span></span>
      </a>
    </div>
    <div class="mem">
      <button id="mem-t" type="button"></button>
      <form id="mem-f" hidden autocomplete="off" onsubmit="return false;">
        <input id="m-id" type="text" spellcheck="false" autocapitalize="none">
        <input id="m-p" type="password" autocomplete="current-password">
        <button type="submit" id="m-go"></button>
        <div id="m-err"></div>
      </form>
    </div>
  </div>
  <div class="foot">napell.space · the space</div>
</div>
<script>
(function () {
  var K = ${JSON.stringify(kind)};
  var T = {
    en: {
      tag: "CONFIDENTIAL",
      t: { private:"A private presentation", used:"Access code already used", ended:"Session ended", invalid:"Invalid access code" },
      m: { private:"Entry is by invitation only. Each invitation opens the proposal once — access stays live for 60 minutes after entry, and closes for good after you leave.",
           used:"Each code opens the door exactly once. Please request a new one below.",
           ended:"Your access window has closed. Scan a new code to re-enter.",
           invalid:"This link is not a valid one-time access code." },
      rhd:"Request an access code", rsub:"Reach me directly — codes are issued personally.",
      memOpen:"Registered under Costs? Sign in instead", memId:"Email, mobile or WeChat ID", memPass:"Password", memGo:"Enter", memErr:"Invalid ID or password.",
      wx:"WeChat", wxcp:"Tap to copy WeChat ID", copied:"Copied ✓",
      waTxt:"Hello Erik, I would like to request a one-time access code for the proposal at napell.space.",
      emSub:"Request: access code for napell.space",
      emBody:"Hello Erik,%0D%0A%0D%0AI would like to request a one-time access code for the proposal at napell.space.%0D%0A%0D%0AName: %0D%0AOrganisation: "
    },
    zh: {
      tag: "机密文件",
      t: { private:"仅限受邀者的私密提案", used:"访问码已被使用", ended:"访问会话已结束", invalid:"访问码无效" },
      m: { private:"本提案凭邀请进入。每份邀请仅可打开一次，进入后可浏览 60 分钟，离开后即刻失效。",
           used:"每个访问码只能开启一次。请在下方重新申请。",
           ended:"你的访问时限已结束。请扫描新的二维码再次进入。",
           invalid:"此链接不是有效的一次性访问码。" },
      rhd:"申请访问码", rsub:"直接联系我——访问码由本人亲自发放。",
      memOpen:"已在 Costs 注册？直接登录进入", memId:"邮箱 / 手机号 / 微信号", memPass:"密码", memGo:"进入", memErr:"账号或密码不正确。",
      wx:"微信", wxcp:"点击复制微信号", copied:"已复制 ✓",
      waTxt:"Erik 你好，我想申请 napell.space 提案的一次性访问码。",
      emSub:"申请：napell.space 访问码",
      emBody:"Erik 你好：%0D%0A%0D%0A我想申请 napell.space 提案的一次性访问码。%0D%0A%0D%0A姓名： %0D%0A机构： "
    },
    ar: {
      tag: "سري للغاية",
      t: { private:"عرض خاص بدعوة فقط", used:"رمز الدخول مستخدم بالفعل", ended:"انتهت جلسة الدخول", invalid:"رمز دخول غير صالح" },
      m: { private:"الدخول بدعوة فقط. كل دعوة تفتح العرض مرة واحدة — يبقى الدخول متاحاً 60 دقيقة بعد الدخول، وينتهي نهائياً بعد مغادرتك.",
           used:"كل رمز يفتح الباب مرة واحدة فقط. يرجى طلب رمز جديد أدناه.",
           ended:"انتهت فترة دخولك. امسح رمزاً جديداً للدخول مرة أخرى.",
           invalid:"هذا الرابط ليس رمز دخول صالحاً." },
      rhd:"اطلب رمز دخول", rsub:"تواصل معي مباشرة — تُسلَّم الرموز شخصياً.",
      memOpen:"مسجَّل في Costs؟ سجِّل دخولك", memId:"البريد / الجوال / معرف وي تشات", memPass:"كلمة المرور", memGo:"دخول", memErr:"المعرف أو كلمة المرور غير صحيحة.",
      wx:"وي تشات", wxcp:"انقر لنسخ معرف وي تشات", copied:"تم النسخ ✓",
      waTxt:"مرحباً إريك، أود طلب رمز دخول لعرض napell.space.",
      emSub:"طلب: رمز دخول لـ napell.space",
      emBody:"مرحباً إريك،%0D%0A%0D%0Aأود طلب رمز دخول لعرض napell.space.%0D%0A%0D%0Aالاسم: %0D%0Aالجهة: "
    }
  };
  var wa = "https://wa.me/85293188252?text=" + encodeURIComponent(T.en.waTxt);
  var em = "mailto:erik.wong@napell.bio?subject=" + encodeURIComponent(T.en.emSub);
  document.getElementById("c-wa").href = wa;
  document.getElementById("c-em").href = em;
  document.getElementById("c-wx").addEventListener("click", function () {
    var n = document.getElementById("c-wx-n"), l = document.getElementById("c-wx-l"), lang = document.documentElement.lang || "en";
    function done() { var o = l.textContent; l.textContent = T[lang] ? T[lang].copied : "Copied ✓"; l.classList.add("copied");
      setTimeout(function(){ l.textContent = o; l.classList.remove("copied"); }, 1800); }
    if (navigator.clipboard) navigator.clipboard.writeText(n.textContent).then(done, done); else done();
  });
  function setL(lang) {
    var t = T[lang]; document.documentElement.lang = lang;
    document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";
    document.getElementById("g-tag").textContent = t.tag;
    document.getElementById("g-title").textContent = t.t[K];
    document.getElementById("g-msg").textContent = t.m[K];
    document.getElementById("g-rhd").textContent = t.rhd;
    document.getElementById("g-rsub").textContent = t.rsub;
    document.getElementById("c-wx-l").textContent = t.wx;
    document.getElementById("mem-t").textContent = t.memOpen;
    document.getElementById("m-id").placeholder = t.memId;
    document.getElementById("m-p").placeholder = t.memPass;
    document.getElementById("m-go").textContent = t.memGo;
    document.getElementById("m-err").textContent = "";
    document.querySelectorAll(".langs button").forEach(function (b) { b.classList.toggle("on", b.dataset.l === lang); });
  }
  document.querySelectorAll(".langs button").forEach(function (b) {
    b.addEventListener("click", function () { setL(b.dataset.l); });
  });
  document.getElementById("mem-t").addEventListener("click", function () {
    var f = document.getElementById("mem-f");
    f.hidden = !f.hidden;
    if (!f.hidden) document.getElementById("m-id").focus();
  });
  document.getElementById("mem-f").addEventListener("submit", function () {
    var id = document.getElementById("m-id").value.trim();
    var p = document.getElementById("m-p").value;
    var err = document.getElementById("m-err");
    if (!id || !p) return;
    fetch("/api/door", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, pass: p }) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) { location.href = "/"; }
        else if (j && j.error === "rate limited") {
          err.textContent = (document.documentElement.lang === "zh") ? "尝试次数过多，请于香港时间午夜后再试。" :
            (document.documentElement.lang === "ar") ? "محاولات كثيرة جداً — أعد المحاولة بعد منتصف الليل." : "Too many attempts — please try again after midnight (HKT).";
        }
        else { err.textContent = (document.documentElement.lang === "zh") ? "账号或密码不正确。" :
                (document.documentElement.lang === "ar") ? "المعرف أو كلمة المرور غير صحيحة." : "Invalid ID or password."; }
      })
      .catch(function () { err.textContent = "Network error — try again."; });
  });
  var nav = (navigator.language || "en").toLowerCase();
  setL(nav.indexOf("zh") === 0 ? "zh" : nav.indexOf("ar") === 0 ? "ar" : "en");
})();
</script>
</body></html>`, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

async function signSession(env, sid, exp) {
  return sha256hex((env.GATE_SECRET || '') + '.' + sid + '.' + exp);
}

async function readSession(req, env) {
  const m = (req.headers.get('cookie') || '').match(/(?:^|;\s*)nsx=([0-9a-f]+)\.(\d+)\.([0-9a-f]+)/);
  if (!m) return null;
  const sid = m[1], exp = Number(m[2]), sig = m[3];
  if (!exp || Date.now() > exp) return null;
  if (sig !== (await signSession(env, sid, String(exp)))) return null;
  return { sid, exp };
}

async function sessionCookie(env, sid, exp) {
  const sig = await signSession(env, sid, String(exp));
  return `nsx=${sid}.${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${Math.floor(SITE_TTL / 1000)}`;
}

async function handleAccess(req, env, ctx) {
  const url = new URL(req.url);
  const tok = (url.searchParams.get('t') || '').trim().toLowerCase();
  if (!/^[0-9a-f]{16,64}$/.test(tok)) {
    return gatePage('invalid');
  }
  const cur = await env.SITE.get('t:' + tok);
  if (cur !== '1') {
    return gatePage('used');
  }
  ctx.waitUntil(env.SITE.put('t:' + tok, JSON.stringify({ used: Date.now(), ip: req.headers.get('cf-connecting-ip') || '' })));
  const sid = (await sha256hex(String(Date.now()) + tok + rand() + rand())).slice(0, 32);
  const exp = Date.now() + SITE_TTL;
  return new Response(null, {
    status: 302,
    headers: {
      'Location': '/',
      'Set-Cookie': await sessionCookie(env, sid, exp),
      'Cache-Control': 'no-store'
    }
  });
}

async function handleLeave(req, env) {
  const s = await readSession(req, env);
  if (s) {
    // Schedule death after the grace period; a reload cancels it.
    await env.SITE.put('x:' + s.sid, String(Date.now() + SITE_GRACE), { expirationTtl: 86400 });
  }
  return new Response(null, { status: 204 });
}

const SITE_MIME = {
  html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'application/javascript; charset=utf-8',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml', ico: 'image/x-icon',
  txt: 'text/plain; charset=utf-8', json: 'application/json', woff2: 'font/woff2', webp: 'image/webp'
};

async function serveSite(req, env, ctx) {
  const s = await readSession(req, env);
  if (!s) return gatePage('private');
  const revoked = await env.SITE.get('x:' + s.sid);
  if (revoked && Date.now() >= Number(revoked)) {
    return gatePage('ended');
  }

  let p;
  try { p = decodeURIComponent(new URL(req.url).pathname); } catch (e) { p = '/'; }
  if (p.endsWith('/')) p += 'index.html';
  const candidates = [p];
  if (!p.includes('.')) candidates.push(p + '/index.html', p + '.html');

  let value = null, meta = null, used = p;
  for (const c of candidates) {
    const r = await env.SITE.getWithMetadata('f:' + c, { type: 'arrayBuffer' });
    if (r.value !== null) { value = r.value; meta = r.metadata || {}; used = c; break; }
  }

  const ext = (used.slice(used.lastIndexOf('.') + 1) || 'html').toLowerCase();
  const ct = (meta && meta.contentType) || SITE_MIME[ext] || 'application/octet-stream';
  const isHtml = ct.includes('html');

  const headers = {
    'Content-Type': ct,
    'Cache-Control': isHtml ? 'private, no-store' : 'public, max-age=3600',
    'Set-Cookie': await sessionCookie(env, s.sid, Date.now() + SITE_TTL)
  };
  if (value === null) {
    return new Response(isHtml ? '' : null, { status: 404, headers });
  }
  ctx.waitUntil(env.SITE.delete('x:' + s.sid)); // page view cancels a pending "leave"
  if ((req.method || 'GET') === 'HEAD') return new Response(null, { status: 200, headers });
  if (isHtml) return new Response(new TextDecoder().decode(value), { status: 200, headers });
  return new Response(value, { status: 200, headers });
}

async function handleTokens(env, url, ctx) {
  const n = Math.min(parseInt(url.searchParams.get('n') || '1', 10) || 1, 50);
  const out = [];
  for (let i = 0; i < n; i++) {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    const t = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    out.push('https://www.napell.space/access?t=' + t);
    ctx.waitUntil(env.SITE.put('t:' + t, '1'));
  }
  if (url.searchParams.get('format') === 'text') {
    return new Response(out.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return json(out);
}

/* ── Cloud QR issue ────────────────────────────────────────────────────────
   GET /api/qr?key=SYNC_KEY[&n=1..10 | &t=<token>][&scale=12][&format=png|svg|json|page]
   Mints one-time access tokens (if &n / no &t) and renders them as QR codes
   entirely in the Worker, so a new investor code can be issued from a phone
   with no PC involved: open /api/qr?key=…&n=1 in the browser, long-press the
   image, save to Photos. Existing tokens can be re-rendered with &t=<token>.

   QR matrix: vendored qrcode-generator (MIT). PNG: hand-rolled encoder using
   CompressionStream('deflate') — 8-bit greyscale, no dependencies. */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, data.length);
  const t = new TextEncoder().encode(type);
  const body = new Uint8Array(t.length + data.length);
  body.set(t, 0); body.set(data, t.length);
  const crc = new Uint8Array(4);
  new DataView(crc.buffer).setUint32(0, crc32(body));
  const out = new Uint8Array(4 + body.length + 4);
  out.set(len, 0); out.set(body, 4); out.set(crc, 4 + body.length);
  return out;
}

async function pngGrey(width, height, raw) {
  const sig = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, width); dv.setUint32(4, height);
  ihdr[8] = 8; ihdr[9] = 0; // 8-bit greyscale
  const cs = new CompressionStream('deflate');
  const w = cs.writable.getWriter();
  w.write(raw); w.close();
  const idat = new Uint8Array(await new Response(cs.readable).arrayBuffer());
  const parts = [sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', new Uint8Array(0))];
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out;
}

function qrMatrix(text) {
  const q = qrcode(0, 'M');           // 0 = auto type number, ECC level M
  q.addData(text);
  q.make();
  const n = q.getModuleCount();
  return { n, dark: (r, c) => q.isDark(r, c) };
}

async function qrPng(text, scale, quiet = 4) {
  const { n, dark } = qrMatrix(text);
  const px = (n + quiet * 2) * scale;
  const stride = px + 1;                         // +1 filter byte per row
  const raw = new Uint8Array(stride * px);
  for (let y = 0; y < px; y++) raw.fill(255, y * stride + 1, y * stride + stride); // white canvas, filter byte stays 0
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!dark(r, c)) continue;
      for (let y = 0; y < scale; y++) {
        const rowStart = (r + quiet) * scale * stride + y * stride;
        for (let x = 0; x < scale; x++) raw[rowStart + 1 + (c + quiet) * scale + x] = 0;
      }
    }
  }
  return pngGrey(px, px, raw);
}

function qrSvg(text, scale, quiet = 4) {
  const { n, dark } = qrMatrix(text);
  const px = (n + quiet * 2) * scale;
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (dark(r, c)) d += `M${(c + quiet) * scale} ${(r + quiet) * scale}h${scale}v${scale}h-${scale}z`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 ${px} ${px}"><rect width="${px}" height="${px}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

function qrPage(tokens, key) {
  const L = tokens.map((t) => `
    <figure>
      <img src="/api/qr?key=${key}&t=${t.token}&scale=12" alt="QR ${t.label}" width="320" height="320">
      <figcaption><b>NO. ${t.label}</b><br><span class="m">${t.state === 'unused' ? 'unused · valid once' : 'ALREADY USED'}</span><br>
      <code>${t.url}</code></figcaption>
    </figure>`).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Access QR — napell.space</title>
<style>
 body{margin:0;padding:28px 16px 48px;background:#000;color:#e7e9ea;font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;text-align:center;}
 h1{font-size:19px;letter-spacing:.1em;text-transform:uppercase;margin:0 0 4px;}
 p.sub{color:#71767b;margin:0 0 26px;font-size:12.5px;}
 figure{margin:0 auto 30px;max-width:360px;background:#0d0f11;border:1px solid #232629;border-radius:14px;padding:16px;}
 img{border-radius:8px;background:#fff;display:block;margin:0 auto 12px;}
 figcaption{font-size:12px;line-height:1.7;color:#e7e9ea;}
 .m{color:#71767b;}
 code{display:block;word-break:break-all;color:#1d9bf0;font-size:11px;margin-top:6px;}
 .tip{color:#71767b;font-size:12px;max-width:420px;margin:0 auto;}
</style></head><body>
<h1>Napell Access QR</h1>
<p class="sub">one-time investor access · valid for a single entry</p>
${L}
<p class="tip">长按图片 → 存储到照片 / Long-press the image → Save to Photos / اضغط مطوّلاً على الصورة ← حفظ في الصور</p>
</body></html>`;
}

async function handleQr(env, url) {
  const key = url.searchParams.get('key') || '';
  const fmt = (url.searchParams.get('format') || '').toLowerCase();
  const scale = Math.min(Math.max(parseInt(url.searchParams.get('scale') || '12', 10) || 12, 4), 24);
  const single = (url.searchParams.get('t') || '').trim().toLowerCase();

  let tokens = [];
  if (single) {
    if (!/^[0-9a-f]{16,64}$/.test(single)) return json({ ok: false, error: 'bad token' }, 400);
    const cur = await env.SITE.get('t:' + single);
    if (cur === null) return json({ ok: false, error: 'unknown token' }, 404);
    tokens.push({ token: single, state: cur === '1' ? 'unused' : 'used' });
  } else {
    const n = Math.min(Math.max(parseInt(url.searchParams.get('n') || '1', 10) || 1, 1), 10);
    for (let i = 0; i < n; i++) {
      const b = new Uint8Array(16);
      crypto.getRandomValues(b);
      const t = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
      await env.SITE.put('t:' + t, '1');
      tokens.push({ token: t, state: 'unused' });
    }
  }
  for (const t of tokens) {
    t.url = 'https://www.napell.space/access?t=' + t.token;
    t.label = t.token.slice(0, 8).toUpperCase();
  }

  if (fmt === 'json') return json({ ok: true, tokens, qr: tokens.map((t) => `/api/qr?key=${key}&t=${t.token}`) });

  if (tokens.length === 1) {
    const t = tokens[0];
    const headers = {
      'Cache-Control': 'no-store',
      'Content-Disposition': `inline; filename="napell-${t.label}.${fmt === 'svg' ? 'svg' : 'png'}"`
    };
    if (fmt === 'svg') {
      return new Response(qrSvg(t.url, scale), { headers: { ...headers, 'Content-Type': 'image/svg+xml; charset=utf-8' } });
    }
    const png = await qrPng(t.url, scale);
    return new Response(png, { headers: { ...headers, 'Content-Type': 'image/png' } });
  }
  return new Response(qrPage(tokens, encodeURIComponent(key)), { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

/* ─── Router ─── */

async function aggregateAndMail(env, date) {
  const rec = await loadDay(env, date);
  return sendMail(env, `[napell.space] Daily report ${date} — ${rec.pv} views, ${Object.keys(rec.ips).length} IPs`, buildReportText(rec));
}

function json(res, status = 200) {
  return new Response(JSON.stringify(res, null, 2), { status, headers: { 'Content-Type': 'application/json' } });
}

/* Cloud sync — mirrors the GitHub repo's site files into the SITE KV so the
   site can be published from any device: edit on github.com (or GitHub mobile),
   push, then open /api/sync?key=SYNC_KEY in a browser. No local PC needed.
   Optional ?branch=dev to sync a non-main branch. */
const SITE_INCLUDE = /\.(html|css|js|jpg|jpeg|png|svg|ico|txt|json|webp|woff2)$/i;
const SITE_SKIP = /^(\.github|\.workbuddy|tools|worker|node_modules)\//;

async function handleSync(env, url) {
  const branch = url.searchParams.get('branch') || 'main';
  const gh = { headers: { 'User-Agent': 'napell-sync' } };
  const treeRes = await fetch(`https://api.github.com/repos/erikcywong/napell.space/git/trees/${branch}?recursive=1`, gh);
  if (!treeRes.ok) return json({ ok: false, error: 'github tree ' + treeRes.status }, 502);
  const tree = (await treeRes.json()).tree || [];
  const files = tree.filter((t) => t.type === 'blob' && SITE_INCLUDE.test(t.path) && !SITE_SKIP.test(t.path));
  let synced = 0;
  const failed = [];
  for (const f of files) {
    const raw = await fetch(`https://raw.githubusercontent.com/erikcywong/napell.space/${branch}/${f.path}`, gh);
    if (!raw.ok) { failed.push(f.path); continue; }
    const buf = await raw.arrayBuffer();
    const ext = (f.path.slice(f.path.lastIndexOf('.') + 1) || 'txt').toLowerCase();
    await env.SITE.put('f:/' + f.path, buf, { metadata: { contentType: SITE_MIME[ext] || 'application/octet-stream' } });
    synced++;
  }
  return json({ ok: failed.length === 0, branch, synced, total: files.length, failed });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;
    const isApi = url.hostname === 'api.napell.space' || path.startsWith('/api/');

    if (isApi) {
      // CORS preflight for the auth endpoints
      if (req.method === 'OPTIONS' && (path === '/api/auth/register' || path === '/api/auth/login')) {
        return new Response(null, { status: 204, headers: corsHeaders(req) });
      }

      if (path === '/api/auth/register' && req.method === 'POST') {
        return handleRegister(req, env, ctx);
      }
      if (path === '/api/auth/login' && req.method === 'POST') {
        return handleLogin(req, env, ctx);
      }
      if (path === '/api/door' && req.method === 'POST') {
        return handleDoorLogin(req, env, ctx);
      }
      if (path === '/api/track' && req.method === 'POST') {
        return handleTrack(req, env, ctx);
      }
      if (path === '/api/leave' && req.method === 'POST') {
        return handleLeave(req, env);
      }
      if (path === '/api/sync' && env.SYNC_KEY && url.searchParams.get('key') === env.SYNC_KEY) {
        return handleSync(env, url);
      }
      if (path === '/api/qr' && env.SYNC_KEY && url.searchParams.get('key') === env.SYNC_KEY) {
        return handleQr(env, url);
      }

      if ((path === '/api/stats' || path === '/api/test' || path === '/api/users' || path === '/api/tokens') && env.STATS_KEY && url.searchParams.get('key') === env.STATS_KEY) {
        if (path === '/api/test') {
          const ok = await sendMail(env, '[napell.space] telemetry test', 'Telemetry worker is live. If you can read this, the mail channel works — the daily report will arrive at 08:00 HKT.');
          return json({ sent: ok, status: sendMail.lastStatus, body: (sendMail.lastBody || '').slice(0, 300) });
        }
        if (path === '/api/users') {
          return handleUsers(env, url);
        }
        if (path === '/api/tokens') {
          return handleTokens(env, url, ctx);
        }
        const day = url.searchParams.get('day') || hktDate(Date.now());
        const rec = await loadDay(env, day);
        if (url.searchParams.get('format') === 'text') {
          return new Response(buildReportText(rec), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        }
        for (const ip of Object.values(rec.ips)) ip.sids = [...ip.sids];
        return json(rec);
      }

      return new Response('not found', { status: 404 });
    }

    // ── Gated presentation site (www.napell.space) ──
    if ((req.method === 'GET' || req.method === 'HEAD')) {
      if (path === '/access') return handleAccess(req, env, ctx);
      return serveSite(req, env, ctx);
    }
    return new Response('not found', { status: 404 });
  },

  async scheduled(event, env, ctx) {
    // 00:00 UTC = 08:00 HKT — report on the HKT day that just ended
    const date = hktDate(Date.now() - 8 * 3600 * 1000 - 60 * 1000);
    ctx.waitUntil(aggregateAndMail(env, date));
  }
};
