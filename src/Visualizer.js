class Visualizer {
    constructor(playerView) {
        this.playerView = playerView;
        this.canvas = playerView.canvas;
        if (this.canvas)
            this.canvasCtx = this.canvas.getContext("2d");
        this.visualizers = [];
        this.currentVisualizer = 0;
        this.connected = false;
        this.visualizing = false;
        this.isInit = false;
        this.frame, this.gain, this.analyser;
        var counter = 0;
        var lastOne;
        var frequencyCircles = function (frame, canvas, ctx, data, timeDomainData, analyser, bufferLength) {
            ctx.globalAlpha = 0.4;
            var doubleData = [];
            var divisor = 8;
            var m = 255 / bufferLength,
                k = m * bufferLength,
                inc = m;
            for (var i = 0; i < bufferLength; i++) {
                doubleData.push({
                    freq: (data[i]),
                    color: [(data[i] / 0.001), (data[i] / 1.5), (data[i] / 2)]
                });
            }

            doubleData.sort(function (a, b) {
                if (a.freq > b.freq) {
                    return -1;
                }
                if (a.freq < b.freq) {
                    return 1;
                }
                return 0;
            });
            while (doubleData[0].freq / divisor >= (canvas.width / 5)) {
                divisor += 0.1;
            }
            divisor += 0.1;
            var w = canvas.getBoundingClientRect().width;
            var h = canvas.getBoundingClientRect().height;
            var opacity = 6 / bufferLength;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.beginPath();
            var cx = canvas.width / 2;
            var cy = canvas.height / 2;
            ctx.closePath();
            ctx.fill();
            for (var z = 0; z < bufferLength; z++) {
                ctx.fillStyle = 'rgba(' + (doubleData[z].color[0]) + ',' + (doubleData[z].color[1]) + ',' + (doubleData[z].color[2]) + ',' + opacity + ')';
                ctx.beginPath();
                ctx.arc(cx, cy, doubleData[z].freq / divisor, 0, 2 * Math.PI);
                ctx.closePath();
                ctx.fill();
            }
        }

        var randomCircles = function (frame, canvas, ctx, frequencyData, timeDomainData, analyser, bufferLength) {
            var sum1 = 0,
                sum2 = 0;

            if (counter % 20 == 0) {
                for (var i = 0; i < frequencyData.length; i++) {
                    sum1 += frequencyData[i];
                }
                if (sum1 > 0) {
                    for (var i = 0; i < bufferLength; i++) {
                        sum2 += timeDomainData[i];
                    }
                    var a1 = sum1 / frequencyData.length,
                        a2 = sum2 / timeDomainData.length;

                    a1 = (a1 * 4) % (canvas.width);
                    a2 = a2 % canvas.height;
                    ctx.beginPath();
                    ctx.arc((a1 % 2 == 0) ? a1 / 3 : a1, a2 / 3 * 2, a1 / 10, 0, 360);
                    ctx.closePath();
                    ctx.fillStyle = 'rgba(' + Math.round(Math.random() * a1) + ',' + Math.round(Math.random() * a1) + ',' + Math.round(Math.random() * a1) + ',' + Math.round(Math.random()) + ')';
                    ctx.strokeStyle = 'rgba(' + Math.round(Math.random() * a1) + ',' + Math.round(Math.random() * a1) + ',' + Math.round(Math.random() * a1) + ',' + Math.round(Math.random()) + ')';
                    (Math.round(Math.random() * 2) % 2 == 0) ? ctx.fill() : ctx.stroke();
                }
            }
            if (counter % (20 * 110) == 0)
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            counter++;
        }
        if (this.canvas) {
            this.addVisualizer('Frequency Circles', frequencyCircles);
            this.addVisualizer('Color Circles', randomCircles);
            this.addVisualizer('Frequncy Line', (frame, canvas, ctx, data, timeDomainData, analyser, bufferLength) => {
                let WIDTH = canvas.width;
                let HEIGHT = canvas.height;
                ctx.clearRect(0, 0, WIDTH, HEIGHT);

                ctx.fillStyle = 'transparent';
                ctx.fillRect(0, 0, WIDTH, HEIGHT);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#d89999';
                ctx.beginPath();

                var sliceWidth = WIDTH * 1.0 / (bufferLength + 1);
                var x = sliceWidth
                ctx.moveTo(0, canvas.height / 2);
                for (var i = 0; i < bufferLength; i++) {
                    var v = timeDomainData[i] / 128.0;
                    var y = v * HEIGHT / 2;
                    ctx.lineTo(x, y);
                    x += sliceWidth;
                }
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
            });
        }
    }

    init(event = undefined) {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.context.createAnalyser();
        this.gain = this.context.createGain();
        this.isInit = true;
    }

    connect(e = undefined) {
        if (!this.isInit)
            this.init(e);
        this.source = this.context.createMediaElementSource(this.playerView.controller.player.getCurrentQueueItem().getSource());
        this.source.connect(this.analyser);
        this.analyser.connect(this.gain);
        this.gain.connect(this.context.destination);
        this.connected = true;
    }

    addVisualizer(name, func) {
        this.visualizers.push({ name: name, func: func });
        if (this.playerView.visualizationList) {
            var visNum = this.visualizers.length - 1;
            var visItem = document.createElement('li');
            var visLink = document.createElement('a');
            visItem.appendChild(visLink);
            visLink.innerHTML = name;
            this.playerView.visualizationList.appendChild(visItem);
            visLink.addEventListener('click', (e) => {
                this.playerView.integrator.visualize(e);
                this.currentVisualizer = visNum;
                if (this.visualizing)
                    this.visualizerOff();
                this.visualize();
                var sel = this.playerView.visualizationList.querySelector('[selected="true"]');
                if (sel) {
                    sel.removeAttribute('selected');
                }
                visLink.setAttribute('selected', 'true');
            });
        }
    }

    visualize() {
        let vis = () => {
            this.bufferLength = this.analyser.frequencyBinCount;
            this.analyser.fftSize = Math.pow(8, 2);
            this.frequencyData = new Uint8Array(this.bufferLength);
            this.analyser.fftSize /= 2;
            this.timeDomainData = new Uint8Array(this.bufferLength);
            this.analyser.getByteFrequencyData(this.frequencyData);
            this.analyser.getByteTimeDomainData(this.timeDomainData);
            this.frame = requestAnimationFrame(vis);
            this.visualizers[this.currentVisualizer].func(this.frame, this.canvas, this.canvasCtx, this.frequencyData, this.timeDomainData, this.analyser, this.bufferLength);
        }
        this.visualizing = true;
        vis();

    }

    visualizerOff() {
        this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        window.cancelAnimationFrame(this.frame);
        this.visualizing = false;
        let selected = this.playerView.visualizationList.querySelector('[selected="true"]');
        selected.removeAttribute('selected');
        return true;
    }
}

export default Visualizer;