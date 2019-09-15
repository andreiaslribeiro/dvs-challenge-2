
var svg, circles, data_, forceSimulation, color;
var margin = {
    top: 25,
    right: 10,
    bottom: 25,
    left: 40
},
    xScale, color, yScale, yAxis,
    width,
    height,
    max_radius = 20,
    min_radius = 2,
    shapesData;
let data = d3.csv("/data/data.csv");
var QRole = 'Which one of these is the closest to describing your role?';
var Qgender = "What's your gender identity?";
var QYearsOfExperience = 'How many years of experience do you have doing professional data visualization?';
var QYearlyPay = 'What is your yearly pay?';
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(10).strength(0.5))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

$(function () {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    width = window.innerWidth - margin.left - margin.right;


    height = window.innerHeight - margin.top - margin.bottom;


    Promise.all([
        data,
    ]).then(function (files) {
        var data_answers = files[0];
        data_ = data_answers
            .sort((elem1, elem2) => {
                const roleA = elem1[QRole].toLocaleLowerCase();
                const roleB = elem2[QRole].toLocaleLowerCase();
                const genderA = elem1[Qgender].toLocaleLowerCase();
                const genderB = elem2[Qgender].toLocaleLowerCase();
                // if (roleA == roleB) {
                //     return (genderA < genderB) ? -1 : (genderA > genderB) ? 1 : 0;
                // }
                // else {
                return (roleA < roleB) ? -1 : 1;
                //   }
            });
        color = d3.scaleOrdinal()
            .domain(data_.map(d => { return d[QRole] }))
            .range(['#66c2a5', '#fba27f', '#a3b1d3', '#eb9fcd', '#b7de73', '#fedf57', '#e9cea7', '#c1c0c0', '#EAB6D5', '#8ADBC1'])

        createSVG();
        createShapesRadial();


    }).catch(function (err) {

    });

    function createSVG() {

        svg = d3.select("#svg-container").append('svg')
            .attr("width", width)
            .attr("height", height)
            .style("left", margin.left + "px")
            .style("top", margin.top + "px").append('g')
            .attr("width", width)
            .attr("height", height)
            .style("transform", 'translate(' + margin.left + 'px, ' + margin.top + 'px)')
    }

    function createShapesRadial() {
        var angle = d3.scaleLinear()
            .range([0, 360])
            .domain([0, data_.length])
        var r1 = width > height ? height / 2 : width / 2;
        var radiusScale = d3.scaleLinear()
            .domain([0, 40])
            .range([20, r1]);

        var circleRadius = d3.scaleBand()
            .domain([
                "",
                "Less than $20,000",
                "$20k - $40k",
                "$40k - $60k",
                "$60k - $80k",
                "$80k - $100k",
                "$100k - $120k",
                "$120k - $140k",
                "$140k - $160k",
                "$160k - $180k",
                "$180k - $200k",
                "$200k+"
            ]).range([0, 11]);

        data_.map((d, i) => {
            var x1 = setX(angle(i), r1);
            var y1 = setY(angle(i), r1)

            var x2 = setX(angle(i), r1 - radiusScale(d[QYearsOfExperience]));
            var y2 = setY(angle(i), r1 - radiusScale(d[QYearsOfExperience]))
            d.x1 = x1;
            d.y1 = y1;
            d.x2 = x2;
            d.y2 = y2;
            d.color = color(d[QRole]);

        });
        console.log(data_)


        let mainGroup = svg
            .append('g')
            .attr('id', 'group-shapes');

        shapesData = mainGroup.selectAll('g')
            .data(data_)
            .enter()

            .append("g")
            .attr('transform', 'translate(' + width / 2 + ', ' + height / 2 + ')')


        // shapesData = group.append('line')

        //     .attr('x1', (d, i) => r1 * Math.cos(angleSlice * i))
        //     .attr('y1', (d, i) => r1 * Math.sin(angleSlice * i))
        //     .attr('x2', (d, i) => (r1 +  radiusScale(d[QYearsOfExperience])) * Math.cos(angleSlice * i))
        //     .attr('y2', (d, i) => (r1 +  radiusScale(d[QYearsOfExperience]))* Math.sin(angleSlice * i))
        //     .attr('stroke', d => color(d[QRole]))

        var path = shapesData.append('path')
            .attr('stroke', d => d.color)
            .attr('fill', 'none')
            .attr('d', (d, i) => {
                return draw_curve(d.x1, d.y1, d.x2, d.y2, 15, d[Qgender]);
            })
            .attr('stroke-opacity', '0.5')
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', 'inherit')
        //.attr('opacity',0)

        var totalLength = path.node().getTotalLength();
        path
            .attr("stroke-dasharray", r1 + totalLength + " " + r1 + totalLength)
            .attr("stroke-dashoffset", r1 + totalLength)
            .transition()
            .delay((d, i) => (Math.random() * 2 +2) * i)
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .attr('opacity', 1)

        // setTimeout(() => {
        //     shapesData.append('circle')
        //         .attr('r', 0)
        //         .attr('cx', d => d.x2)
        //         .attr('cy', d => d.y2)
        //         .attr('fill', d => d.color)
        //         .attr('fill-opacity', 0.2)
        //         .transition()
        //         .ease(d3.easeLinear)
        //         .duration(200)
        //         .attr('r', d => circleRadius(d[QYearlyPay]))
        // }, 4000)

     


    }

    function setX(angle, radius) {
        const radians = 0.0174532925
        // change to clockwise
        let a = 360 - angle
        // start from 12 o'clock
        return radius * Math.sin(a * radians)
    }

    function setY(angle, radius) {
        const radians = 0.0174532925
        // change to clockwise
        let a = 360 - angle
        // start from 12 o'clock
        return radius * Math.cos(a * radians)
    }
    function draw_curve(Ax, Ay, Bx, By, M, setSign) {

        // Find midpoint J
        var Jx = Ax + (Bx - Ax) / 2
        var Jy = Ay + (By - Ay) / 2

        // We need a and b to find theta, and we need to know the sign of each to make sure that the orientation is correct.
        var a = Bx - Ax
        // var asign = (a < 0 ? -1 : 1)
        console.log(setSign)
        var asign = setSign === 'Man' ? 1 : -1;
        var b = By - Ay
        var bsign = (b < 0 ? -1 : 1)
        var theta = Math.atan(b / a)

        // Find the point that's perpendicular to J on side
        var costheta = asign * Math.cos(theta)
        var sintheta = asign * Math.sin(theta)

        // Find c and d
        var c = M * sintheta
        var d = M * costheta

        // Use c and d to find Kx and Ky
        var Kx = Jx - c
        var Ky = Jy + d

        return "M" + Ax + "," + Ay +
            "Q" + Kx + "," + Ky +
            " " + Bx + "," + By
    }




});

