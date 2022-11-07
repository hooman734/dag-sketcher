const SVG = document.getElementById('SVG');
const TXT = document.getElementById("input-data");
const SKETCH = document.getElementById("sketch")
const CLEAR = document.getElementById("clear");
const FILE_SELECTOR = document.getElementById("file-selector");
const FILE_INPUT = document.getElementById("file-input");
const AVAILABLE_RADIUS = (4*Math.min(SVG.clientWidth, SVG.clientHeight) + 3*Math.max(SVG.clientWidth, SVG.clientHeight)) / 210;

let nodesInput = {};
let board = [];


FILE_INPUT.addEventListener("click", () => {
    FILE_SELECTOR.click();
    fileHandler();
});

const randomAxisGenerator = (margin=1.5*AVAILABLE_RADIUS) => {
    const height = margin + Math.floor(Math.random() * (SVG.clientHeight - margin * 2));
    const width = margin + Math.floor(Math.random() * (SVG.clientWidth - margin * 2));
    return new Axis(height, width);
}

const axisGenerator = () => {
    let temp = randomAxisGenerator();
    while (board.some(spot => spot.overlaps(temp))) {
        temp = randomAxisGenerator();
    }
    board.push(temp);
    return temp;
};

class Axis {
    constructor(height, width) {
        this.height = height;
        this.width = width;
    }

    overlaps(other, tolerance=3*AVAILABLE_RADIUS) {
        const xDifSquared = (this.width - other.width) ** 2;
        const yDifSquared = (this.height - other.height) ** 2;
        const distanceSquared = Math.sqrt(xDifSquared + yDifSquared);
        return distanceSquared < tolerance;
    }
}

class Node {
    constructor(tagName, x, y, neighbors=[], radius=AVAILABLE_RADIUS) {
        this.radius = radius;
        this.x = x + this.radius;
        this.y = y + this.radius;
        this.tagName = tagName;
        this.neighbors = [...neighbors];
        this.element = this.nodeElementMaker();
        this.tagElement = this.nodeTagMaker();
    }

    nodeElementMaker() {
        const nodeElement = document.createElementNS('http://www.w3.org/2000/svg','circle');
        nodeElement.setAttribute('cx', `${this.x}`);
        nodeElement.setAttribute('cy', `${this.y}`);
        nodeElement.setAttribute('r', `${this.radius}`);
        nodeElement.setAttribute('fill', 'paleturquoise');
        nodeElement.setAttribute('stroke', 'black');
        nodeElement.setAttribute('stroke-width', '1');
        return nodeElement;
    }

    nodeTagMaker() {
        const tag = document.createElementNS('http://www.w3.org/2000/svg','text');
        tag.setAttribute('x', `${this.x}`);
        tag.setAttribute('y', `${this.y+AVAILABLE_RADIUS/4}`);
        tag.setAttribute('fill', 'black');
        tag.setAttribute('font-size',  `${AVAILABLE_RADIUS-(AVAILABLE_RADIUS/10)**2}`);
        tag.setAttribute('font-family', 'Verdana');
        tag.setAttribute('text-anchor', 'middle');
        tag.textContent = `${this.tagName}`;
        return tag;
    }

    show(svg) {
        svg.appendChild(this.element);
        svg.appendChild(this.tagElement);
    }

    remove(svg) {
        svg.removeChild(this.tagElement);
        svg.removeChild(this.element);
    }
}


class Arrow {
    constructor(x1, y1, x2, y2, margin=AVAILABLE_RADIUS/3) {
        this.x1 = x1 + margin;
        this.y1 = y1 + margin;
        this.x2 = x2;
        this.y2 = y2;
        this.elements = this.arrowElementMaker();
    }

    arrowElementMaker() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
        const polygon = document.createElementNS('http://www.w3.org/2000/svg','polygon');
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');

        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', `${AVAILABLE_RADIUS+8-(AVAILABLE_RADIUS/10)**2}`);
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');

        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');

        line.setAttribute('x1', `${this.x1}`);
        line.setAttribute('y1', `${this.y1}`);
        line.setAttribute('x2', `${this.x2}`);
        line.setAttribute('y2', `${this.y2}`);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('marker-end', 'url(#arrowhead)');

        marker.appendChild(polygon);
        defs.appendChild(marker);

        return [defs, line];
    }

    show(svg) {
        svg.appendChild(this.elements[0]);
        svg.appendChild(this.elements[1]);
    }

    remove(svg) {
        this.elements.forEach(element => svg.removeChild(element));
    }
}


let nodes = [];
let arrows = [];

const sketch = () => {
    clearSketch();
    parser();
    if (nodesInput.length) {
        return
    }
    const nodeNames = Object.keys(nodesInput);
    
    nodeNames.forEach(nodeName => {
        const newAxis = axisGenerator();
        newNode = new Node(nodeName, newAxis.width, newAxis.height, neighbors=nodesInput[nodeName]);
        nodes.push(newNode);
    });

    nodes.forEach(node => {
        node.neighbors.forEach(neighbor => {
            const neighborNode = nodes.find(node => node.tagName === neighbor);
            const newArrow = new Arrow(node.x, node.y, neighborNode.x, neighborNode.y);
            arrows.push(newArrow);
            newArrow.show(SVG);
        });
    });

    nodes.forEach(node => {
        node.show(SVG);
    });
}

const clearSketch = () => {
    if (nodes.length > 0) {
        nodes.forEach(node => {
            node.remove(SVG);
        });
    }
    if (arrows.length > 0) {
        arrows.forEach(arrow => {
            arrow.remove(SVG);
        });
    }
    nodes = [];
    arrows = [];
    board=[];
}

const fileHandler = () => {
    const action = () => {
        const file = FILE_SELECTOR.files[0];
        const reader = new FileReader();
        const loadingAction = () => {
            TXT.value = reader.result;
            reader.removeEventListener('load', loadingAction);
        }
        reader.addEventListener('load', loadingAction);
        if (file) {
            reader.readAsText(file);
        }
        FILE_SELECTOR.removeEventListener('change', action);
    }
    FILE_SELECTOR.addEventListener('change', action);
}

const parser = () => {
    const lines = TXT.value.split('\n');
    const adjacencyList = {};
    const pairs = [];
    lines.map(item => {
       
        matchedItem = item.match(/^[^-=>+ ]+|[^-=>+ ]+$/g);
        if (matchedItem && matchedItem.length === 2 && matchedItem[0] !== undefined && matchedItem[1] !== undefined) {
            pairs.push(matchedItem);
        }
    });
    pairs.forEach(pair => {
        if (pair[1] in adjacencyList === false) {
            adjacencyList[pair[1]] = [];
        }
        if (pair[0] in adjacencyList) {
            adjacencyList[pair[0]].push(pair[1]);
        } else {
            adjacencyList[pair[0]] = [pair[1]];
        }
    });
    nodesInput = adjacencyList;
}


SKETCH.addEventListener("click", () => {
    if (TXT.value === '' || nodesInput === {}) {
        alert('Please input data first.');
    } else {
        sketch();
    }
});

CLEAR.addEventListener("click", () =>{
    nodesInput = {};
    TXT.value = '';
});


