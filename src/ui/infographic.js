
export class Infographic {

    /**
    * This constructor creates the chart itself and surrounding HTML such as dropdown buttons.
    * @param {string} chart_id - The id of the chart.
    * @param {string} chartType - The type of the chart, i.e line, pie or donut.
    * @param {string} title - The title of the infographic.
    * @param {int} width - The width of a chart.
    * @param {int} height - The height of a chart.
    * @param {string} data - The data to be inserted into a given chart.
    */
    constructor(chart_id, chartType, title, width, height, data) {
        if (constructor === 'Infographic') {
            throw new Error("Cannot instantiate abstract class \"Infographic\".");
        }

        this.context = null;
        this.chart = null;
        this.updateAnimation = false;

        this.typename = chartType;
        this.data = data;
        this.dropdowns = [];
        this.dindex = 0;

        /** References to HTML objects */
        this.dropdown = null;
        this.container = null;

        /** Canvas generation */
        if (chart_id === "donut"){
          var allCharts = document.getElementById("donut_chart");
        } else if (chart_id === "pie"){
          var allCharts = document.getElementById("pie_chart");
        } else if (chart_id === "line"){
          var allCharts = document.getElementById("line_chart");
        } else {
          var allCharts = document.getElementById("overflow_charts");
        }

        this.container = document.createElement("div");
        this.container.class = "container";
        this.container.style = "max-width: 800px; margin: 50px auto;";

        this.container.innerHTML =
        "<div>\n" +
        "<h2 style=\"font-size: 24pt\">" + title + "</h2>\n" +
        "<canvas id=\"" + chart_id + "\" width=\"" + width + "\" height=\"" + height + "\"></canvas>" +
        "</div>";

        /** Dropdown generation for charts with more than one option. */
        if (this.data.length > 1) {
            this.dropdown = document.createElement("label");

            this.dropdown.innerHTML = "Choose data type:\n";
            allCharts.appendChild(this.dropdown);

            var selector = document.createElement("select");

            // TODO: are these needed? (don't think they need to be these names, might not be needed at all, originally for testing - Tom)
            selector.class = "charts";
            selector.name = "ice-cream";
            selector.id = "chartSelect";

            for (var i = 0; i < this.data.length; i++) {
                selector.innerHTML = selector.innerHTML + "<option value=\"" + this.data[i].name + "\">" + this.data[i].name + "</option>\n";
            }

            var infographic = this;
            selector.onchange = function(change_event) {
                var selected = change_event.target.value;

                for (var i = 0; i < infographic.data.length; i++) {
                    if (selected === infographic.data[i].name){
                        if (infographic.chart != null) {
                            infographic.chart.destroy();
                        }
                        // Populate the chart
                        infographic.populate(i);
                        break;
                    }
                }

            };

            this.dropdown.appendChild(selector);
        }

        allCharts.appendChild(this.container);
        this.context = document.getElementById(chart_id);

        /** Populate with default data */
        this.populate(this.dindex);
    }

    /** Populate the chart with the specified option index */
    populate(index) {
        if (this.data.length > 0 && this.data[index].datasets != null && this.data[index].datasets.length > 0) {
            this.dindex = index;
            this.stopDrawing();
            this.chart = new Chart(this.context, {
                type: this.typename,
                data: {
                    labels: this.data[index].labels,
                    datasets: this.data[index].datasets
                },
                options: this.data[index].options
            });
        } else {
            this.startDrawing();
        }
    }

    /** Start drawing the loading animation */
    startDrawing() {
        // TODO: Check if data is being loaded. If so, show spinning wheel; otherwise show "No data available".
        var canvas = this.context.getContext("2d");
        canvas.save();
        this.updateAnimation = true;
        var infographic = this;
        window.requestAnimationFrame(function () { infographic.drawLoading(); });
    }

    /** Stop drawing the loading animation */
    stopDrawing() {
        this.updateAnimation = false;
    }

    /** Draw a frame of the loading animation */
    drawLoading() {
        var canvas = this.context.getContext("2d");
        var halfDim = { w: this.context.width / 2, h: this.context.height / 2 };

        canvas.globalCompositeOperation = 'destination-over';
        canvas.clearRect(0, 0, halfDim.w * 2, halfDim.h * 2);
        canvas.fillStyle = 'rgba(0, 255, 255, 1)';
        canvas.strokeStyle = 'rgba(200, 200, 200, 1)';
        canvas.save();

        var loadingSpinSpeed = 1;
        var loadingDotRadius = 8;
        var loadingWheelRadius = 32;

        /** Loading wheel */
        var time = (new Date()).getMilliseconds();
        var deltaTime = (time - this.lastTime) / 1000;
        for (var i = 0, count = 1; i < count; i++) {
            var trans = {
                x: halfDim.w - loadingWheelRadius - loadingDotRadius,
                y: halfDim.h - loadingWheelRadius - loadingDotRadius
            };


            canvas.translate(trans.x, trans.y);
            canvas.rotate((2 * Math.PI) * deltaTime * loadingSpinSpeed);

            /** Draw loading dot */
            canvas.beginPath();
            canvas.arc(loadingWheelRadius, 0, loadingDotRadius, 0, 2 * Math.PI);
            canvas.fill();
            canvas.translate(-trans.x, -trans.y);


            /** Draw wheel */
            canvas.beginPath();
            canvas.arc(trans.x, trans.y, loadingWheelRadius, 0, 2 * Math.PI);
            canvas.lineWidth = loadingDotRadius * 2;
            canvas.stroke();
        }
        this.lastTime = time;

        if (this.updateAnimation) {
            var infographic = this;
            window.requestAnimationFrame(function () { infographic.drawLoading(); });
        } else {
            canvas.restore();
        }
    }

    drawEmpty() {
        var canvas = this.context.getContext("2d");
    }

    /** Update the infographic with new data */
    update(data) {
        this.data = data;
        this.populate(this.dindex);
    }

}
