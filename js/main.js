/*
*    main.js
*    Project  - Gapminder 
*/

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

let time = 0

// Scales
const x = d3.scaleLog()
  .base(10)
  .range([0, WIDTH])
  .domain([142, 150000])
const y = d3.scaleLinear()
  .range([HEIGHT, 0])
  .domain([0, 90])
const area = d3.scaleLinear()
  .range([25 * Math.PI, 1500 * Math.PI])
  .domain([2000, 1400000000])
const continentColor = d3.scaleOrdinal(d3.schemePastel1)

// Labels
const xLabel = g.append("text")
  .attr("y", HEIGHT + 50)
  .attr("x", WIDTH / 2)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("GDP Per Capita ($)")
const yLabel = g.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", -40)
  .attr("x", -170)
  .attr("font-size", "20px")
  .attr("text-anchor", "middle")
  .text("Life Expectancy (Years)")
const timeLabel = g.append("text")
  .attr("y", HEIGHT - 10)
  .attr("x", WIDTH - 40)
  .attr("font-size", "40px")
  .attr("opacity", "0.4")
  .attr("text-anchor", "middle")
  .text("1800")

// X Axis
const xAxisCall = d3.axisBottom(x)
  .tickValues([400, 4000, 40000])
  .tickFormat(d3.format("$"));
g.append("g")
  .attr("class", "x axis")
  .attr("transform", `translate(0, ${HEIGHT})`)
  .call(xAxisCall)

// Y Axis
const yAxisCall = d3.axisLeft(y)
g.append("g")
  .attr("class", "y axis")
  .call(yAxisCall)

d3.json("data/data.json").then(function (data) {
  // clean data
  const formattedData = data.map(year => {
    return year["countries"].filter(country => {
      const dataExists = (country.income && country.life_exp)
      return dataExists
    }).map(country => {
      country.income = Number(country.income)
      country.life_exp = Number(country.life_exp)
      return country
    })
  })

  // run the code every 0.1 second
  d3.interval(function () {
    // at the end of our data, loop back
    time = (time < 214) ? time + 1 : 0
    update(formattedData[time])
  }, 100)

  // first run of the visualization
  update(formattedData[0])
})

function update(data) {
  // standard transition time for the visualization
  const t = d3.transition()
    .duration(100)

  // JOIN new data with old elements.
  const circles = g.selectAll("circle")
    .data(data, d => d.country)

  // EXIT old elements not present in new data.
  circles.exit().remove()

  // ENTER new elements present in new data.
  circles.enter().append("circle")
    .attr("fill", d => continentColor(d.continent))
    .merge(circles)
    .transition(t)
    .attr("cy", d => y(d.life_exp))
    .attr("cx", d => x(d.income))
    .attr("r", d => Math.sqrt(area(d.population) / Math.PI))

  // update the time label
  timeLabel.text(String(time + 1800))
}

// Define continents and their colors
const continents = ["Africa", "Americas", "Asia", "Europe", "Oceania"];
const colorScheme = d3.schemePastel1;

// Create legend
const legend = d3.select("#legend")
  .append("svg")
  .attr("width", 200)
  .attr("height", 150)
  .selectAll("g")
  .data(continents)
  .enter().append("g")
  .attr("transform", (d, i) => `translate(0, ${i * 20})`);

legend.append("rect")
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", (d, i) => colorScheme[i]);

legend.append("text")
  .attr("x", 24)
  .attr("y", 9)
  .attr("dy", ".35em")
  .text(d => d);

// Summary points from Hans Rosling's video
const summaryPoints = [
  "In 1810, all countries were poor and had low life expectancy.",
  "During the Industrial Revolution, Western countries improved in wealth and health.",
  "Colonial era and epidemics affected global health negatively.",
  "World War I and the Spanish Flu caused a sharp drop in life expectancy worldwide.",
  "The interwar period saw recovery in Western countries, despite the Great Depression.",
  "World War II significantly impacted global life expectancy and wealth.",
  "Post-war reconstruction led to economic booms in the West.",
  "Decolonization in the 1950s-70s resulted in gradual improvements in newly independent countries.",
  "The 1980s-2000s saw significant economic growth in East Asia.",
  "Overall, the modern era shows global improvement in life expectancy and income."
];

// Append summary points to the summary list
const summaryList = d3.select("#summary-list");
summaryPoints.forEach(point => {
  summaryList.append("li").text(point);
});
