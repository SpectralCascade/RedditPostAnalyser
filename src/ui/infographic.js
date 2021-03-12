
export class Infographic {
    
    constructor(chart_id, chartType, title, width, height, data) {
        if (constructor === 'Infographic') {
            throw new Error("Cannot instantiate abstract class \"Infographic\".");
        }
        
        this.context = null;
        this.chart = null;
            
        this.typename = chartType;
        this.data = data;
        this.dropdowns = [];
        
        // Canvas generation
        var allCharts = document.getElementById("all_charts");
        var container = document.createElement("div");
        container.class = "container";
        container.style = "max-width: 800px; margin: 50px auto;";
        
        container.innerHTML =
        "<div>\n" + 
        "<h2 style=\"font-size: 24pt\">" + title + "</h2>\n" +
        "<canvas id=\"" + chart_id + "\" width=\"" + width + "\" height=\"" + height + "\"></canvas>" +
        "</div>";
        
        // Dropdown generation for charts with more than one option.
        if (this.data.length > 1) {
            var dropdown = document.createElement("label");
            dropdown.innerHTML = "Choose data type:\n";
            allCharts.appendChild(dropdown);
            
            var selector = document.createElement("select");
            
            // TODO: are these needed?
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
            
            dropdown.appendChild(selector);
        }
        
        allCharts.appendChild(container);
        this.context = document.getElementById(chart_id);

        // Populate with default data
        this.populate(0);
    }
    
    populate(index) {
        if (this.data[index].datasets.length > 0) {
            this.chart = new Chart(this.context, {
                type: this.typename,
                data: {
                    labels: this.data[index].labels,
                    datasets: this.data[index].datasets
                }
            });
        } else {
            this.startDrawing();
        }
    }
    
    add(data) {
        this.data.push(data);
    }
    
    startDrawing() {
        // TODO: Check if data is being loaded. If so, show spinning wheel; otherwise show "No data available".
        window.requestAnimationFrame(this.drawLoading);
    }
    
    drawLoading() {
        var canvas = this.context.getContext("2d");
        canvas.globalCompositeOperation = 'destination-over';
        canvas.clear();
        canvas.fillStyle = 'rgba(0, 0, 0, 0.4)';
        canvas.strokeStyle = 'rgba(0, 255, 255, 0.4)';
        canvas.save();
        
        // Spinning dot(s)
        var time = new Date();
        for (var i = 0, count = 1; i < count; i++) {
            canvas.rotate(((2 * Math.PI) / 60) * time.getSeconds() + ((2 * Math.PI) / 6000) * time.getMilliseconds());
            canvas.fillCircle(0, 0, 24);
        }
        canvas.save();
        canvas.restore();
        
        window.requestAnimationFrame(this.drawLoading);
    }
    
    drawEmpty() {
        var canvas = this.context.getContext("2d");
    }
    
    update() {
        // todo, populate dropdowns etc.
    }
    
}
