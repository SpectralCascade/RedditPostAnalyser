
export class Infographic {
    constructor(){}
    
    add(dropdown_option, chart_data) {
        data.push(chart_data);
        options.push(dropdown_option);
    }
    
    update() {
        // todo, populate dropdowns etc.
    }
    
    data = [];
    options = [];
    dropdowns = [];
    currentOption = 0;
    
}
