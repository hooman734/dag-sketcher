const SVG=document.getElementById("SVG"),TXT=document.getElementById("input-data"),SKETCH=document.getElementById("sketch"),CLEAR=document.getElementById("clear"),FILE_SELECTOR=document.getElementById("file-selector"),FILE_INPUT=document.getElementById("file-input");FILE_INPUT.addEventListener("click",()=>{FILE_SELECTOR.click(),fileHandler()});const availableRadius=(4*Math.min(SVG.clientWidth,SVG.clientHeight)+3*Math.max(SVG.clientWidth,SVG.clientHeight))/90;let nodesInput={},board=[];const randomAxisGenerator=(n=1.5*availableRadius)=>{const t=n+Math.floor(Math.random()*(SVG.clientHeight-n*2)),e=n+Math.floor(Math.random()*(SVG.clientWidth-n*2));return new Axis(t,e)},axisGenerator=()=>{let n=randomAxisGenerator();for(;board.some(t=>t.overlaps(n));)n=randomAxisGenerator();return board.push(n),n};class Axis{constructor(t,e){this.height=t,this.width=e}overlaps(t,e=3*availableRadius){const s=(this.width-t.width)**2,i=(this.height-t.height)**2;return Math.sqrt(s+i)<e}}class Node{constructor(t,e,s,i=[],r=availableRadius){this.radius=r,this.x=e+this.radius,this.y=s+this.radius,this.tagName=t,this.neighbors=[...i],this.element=this.nodeElementMaker(),this.tagElement=this.nodeTagMaker()}nodeElementMaker(){const t=document.createElementNS("http://www.w3.org/2000/svg","circle");return t.setAttribute("cx",`${this.x}`),t.setAttribute("cy",`${this.y}`),t.setAttribute("r",`${this.radius}`),t.setAttribute("fill","paleturquoise"),t.setAttribute("stroke","black"),t.setAttribute("stroke-width","1"),t}nodeTagMaker(){const t=document.createElementNS("http://www.w3.org/2000/svg","text");return t.setAttribute("x",`${this.x}`),t.setAttribute("y",`${this.y+availableRadius/4}`),t.setAttribute("fill","black"),t.setAttribute("font-size",`${availableRadius-(availableRadius/10)**2}`),t.setAttribute("font-family","Verdana"),t.setAttribute("text-anchor","middle"),t.textContent=`${this.tagName}`,t}show(t){t.appendChild(this.element),t.appendChild(this.tagElement)}remove(t){t.removeChild(this.tagElement),t.removeChild(this.element)}}class Arrow{constructor(t,e,s,i,r=availableRadius/3){this.x1=t+r,this.y1=e+r,this.x2=s,this.y2=i,this.elements=this.arrowElementMaker()}arrowElementMaker(){const t=document.createElementNS("http://www.w3.org/2000/svg","defs"),e=document.createElementNS("http://www.w3.org/2000/svg","marker"),s=document.createElementNS("http://www.w3.org/2000/svg","polygon"),i=document.createElementNS("http://www.w3.org/2000/svg","line");return e.setAttribute("id","arrowhead"),e.setAttribute("markerWidth","10"),e.setAttribute("markerHeight","7"),e.setAttribute("refX",`${availableRadius+8-(availableRadius/10)**2}`),e.setAttribute("refY","3.5"),e.setAttribute("orient","auto"),s.setAttribute("points","0 0, 10 3.5, 0 7"),i.setAttribute("x1",`${this.x1}`),i.setAttribute("y1",`${this.y1}`),i.setAttribute("x2",`${this.x2}`),i.setAttribute("y2",`${this.y2}`),i.setAttribute("stroke","black"),i.setAttribute("stroke-width","1.5"),i.setAttribute("marker-end","url(#arrowhead)"),e.appendChild(s),t.appendChild(e),[t,i]}show(t){t.appendChild(this.elements[0]),t.appendChild(this.elements[1])}remove(t){this.elements.forEach(e=>t.removeChild(e))}}let nodes=[],arrows=[];const sketch=()=>{if(clearSketch(),parser(),nodesInput.length)return;Object.keys(nodesInput).forEach(t=>{const e=axisGenerator();newNode=new Node(t,e.width,e.height,neighbors=nodesInput[t]),nodes.push(newNode)}),nodes.forEach(t=>{t.neighbors.forEach(e=>{const s=nodes.find(r=>r.tagName===e),i=new Arrow(t.x,t.y,s.x,s.y);arrows.push(i),i.show(SVG)})}),nodes.forEach(t=>{t.show(SVG)})},clearSketch=()=>{nodes.length>0&&nodes.forEach(n=>{n.remove(SVG)}),arrows.length>0&&arrows.forEach(n=>{n.remove(SVG)}),nodes=[],arrows=[],board=[]},fileHandler=()=>{const n=()=>{const t=FILE_SELECTOR.files[0],e=new FileReader,s=()=>{TXT.value=e.result,e.removeEventListener("load",s)};e.addEventListener("load",s),t&&e.readAsText(t),FILE_SELECTOR.removeEventListener("change",n)};FILE_SELECTOR.addEventListener("change",n)},parser=()=>{const n=TXT.value.split(`
`),t={},e=[];n.map(s=>{matchedItem=s.match(/^[^-=>+ ]+|[^-=>+ ]+$/g),matchedItem&&matchedItem.length===2&&matchedItem[0]!==void 0&&matchedItem[1]!==void 0&&e.push(matchedItem)}),e.forEach(s=>{s[1]in t||(t[s[1]]=[]),s[0]in t?t[s[0]].push(s[1]):t[s[0]]=[s[1]]}),nodesInput=t};SKETCH.addEventListener("click",()=>{TXT.value===""||nodesInput==={}?alert("Please input data first."):sketch()}),CLEAR.addEventListener("click",()=>{nodesInput={},TXT.value=""});
