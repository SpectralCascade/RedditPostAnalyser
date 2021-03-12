
export class Infographic {
    
    constructor(chart_id, title, width, height, data) {
        if (constructor === 'Infographic') {
            throw new Error("Cannot instantiate abstract class \"Infographic\".");
        }
        
        this.context = null;
        this.chart = null;
        this.populate = function(index) {};
            
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
        
        // Dropdown generation
        if (this.data.length > 0) {
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
                        // Populate the chart
                        infographic.populate(i);
                        break;
                    }
                }
                
            };
            
            dropdown.appendChild(selector);
        }
        
        allCharts.appendChild(container);

    }
    
    add(data) {
        this.data.push(data);
    }
    
    update() {
        // todo, populate dropdowns etc.
    }
    
}
