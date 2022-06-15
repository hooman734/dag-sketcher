const SVG = document.getElementById('SVG');
const TXT = document.getElementById("input-data");


const availableWidth = SVG.clientWidth;
const availableHeight = SVG.clientHeight;

const nodesInput = {
    'A': ['B', 'E'],
    'B': ['A'],
    'C': ['E'],
    'E': [],
}

const parsedData = [];

const dataParser = (e) => {
    if (e.keyCode === 13) {
        const text = TXT.value;
        const points = [...text.matchAll(/(\S*)\s*->\s*(\S*)/gm)].map(match => [match[1], match[2]]);
        parsedData.push(points);
        console.log(parsedData);
        console.log(TXT.value);
    }
}
document.addEventListener("keypress", dataParser);



const board = [];

const nodeNames = Object.keys(nodesInput);

const randomAxisGenerator = (tolerance=50) => {
    const height = tolerance + Math.floor(Math.random() * (availableHeight - tolerance * 2));
    const width = tolerance + Math.floor(Math.random() * (availableWidth - tolerance * 2));

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

    overlaps(other, tolerance=150) {
        const xDifSquared = (this.width - other.width) ** 2;
        const yDifSquared = (this.height - other.height) ** 2;
        const distanceSquared = Math.sqrt(xDifSquared + yDifSquared);
        return distanceSquared < tolerance;
    }
}

class Node {
    constructor(tagName, x, y, neighbors=[], radius=30) {
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
        nodeElement.setAttribute('stroke', 'blue');
        nodeElement.setAttribute('stroke-width', '3');
        return nodeElement;
    }

    nodeTagMaker() {
        const tag = document.createElementNS('http://www.w3.org/2000/svg','text');
        tag.setAttribute('x', `${this.x}`);
        tag.setAttribute('y', `${this.y+10}`);
        tag.setAttribute('fill', 'black');
        tag.setAttribute('font-size',  '26');
        tag.setAttribute('font-family', 'Verdana');
        tag.setAttribute('text-anchor', 'middle');
        tag.textContent = `${this.tagName}`;
        return tag;
    }

    show(svg) {
        svg.appendChild(this.element);
        svg.appendChild(this.tagElement);
    }
}


class Arrow {
    constructor(x1, y1, x2, y2, margin=10) {
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
        marker.setAttribute('refX', '30');
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
}

const nodes = [];

nodeNames.forEach(nodeName => {
    const newAxis = axisGenerator();
    newNode = new Node(nodeName, newAxis.width, newAxis.height, neighbors=nodesInput[nodeName]);
    nodes.push(newNode);
    console.log(newNode);
});

nodes.forEach(node => {
    node.neighbors.forEach(neighbor => {
        const neighborNode = nodes.find(node => node.tagName === neighbor);
        const newArrow = new Arrow(node.x, node.y, neighborNode.x, neighborNode.y);
        newArrow.show(SVG);
    });
});

nodes.forEach(node => {
    node.show(SVG);
});

