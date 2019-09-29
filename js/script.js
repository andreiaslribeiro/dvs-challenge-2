
var svg, circles, data_, countries_, forceSimulation, color;
var margin = {
    top: 25,
    right: 10,
    bottom: 25,
    left: 50
},
    xScale, color, yScale, yAxis,
    width,
    height,
    max_radius = 20,
    min_radius = 2,
    shapesData,
    circleRadius,
    curveScale, lengthScale, r1;
let data = d3.csv("data/data.csv");
var scaleLearning;
var QRole = 'Which one of these is the closest to describing your role?';
var Qgender = "What's your gender identity?";
var QYearsOfExperience = 'How many years of experience do you have doing professional data visualization?';
var QStudySchool = 'Have you studied data visualization in school (or other formal environment) or did you learn how to do it on your own?';
var QYearlyPay = 'What is your yearly pay?';
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(10).strength(0.5))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var selectionOp = 1;
var notSelectedOp = 0.1;
var totalElements = 0;
$(function () {
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    width = window.innerWidth - margin.left - margin.right;
    height = window.innerHeight - margin.top - margin.bottom;
    Promise.all([
        data,
    ]).then(function (files) {
        var data_answers = files[0];
       
        data_ = data_answers;
        data_
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

            totalElements = data_.length;
        createSVG();
        setupScales()
        createShapesRadial();
        //legends
        createLegend(d3.select('#legend-role'), color.domain(), QRole);
        legendGender();
        legendYearlyPay();
        legendExperience();

        legendLearning();

        d3.select('#is-freelancer').on('mouseover', d => {
            var count = 0;
            shapesData
                .transition()
                .duration(100)
                .attr('opacity', p => {
                    var opt;
                    if(p["Are you a freelancer/consultant?"] === 'Yes'){
                        count++;
                        opt =  selectionOp ;
                    }else{
                        opt = notSelectedOp
                    }
                    return opt;
                })
                updateValues(count)
        })
            .on('mouseout', d => {
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', 1)
                    updateValues(totalElements)
                    
            })


    }).catch(function (err) {
    });

    function setupScales() {
        // role scale
        color = d3.scaleOrdinal()
            .domain(data_.map(d => { return d[QRole] }))
            .range(['#66c2a5', '#fba27f', '#a3b1d3', '#eb9fcd', '#b7de73', '#fedf57', '#e9cea7', '#c1c0c0', '#FF6F91', '#0089BA'])

        // learning scale
        scaleLearning = d3.scaleOrdinal()
            .domain(['Mostly Self-Taught', 'Equal Parts School and Self-Taught', 'Mostly From School (or other formal courses)'])
            .range(['1', '4', '0'])
        circleRadius = d3.scaleBand()
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
            ]).range([2, 10]);
        curveScale = d3.scaleBand()
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
            ]).range([5, 20]);

        r1 = width > height ? height / 2 - 30 : width / 2 - 30;
        var max = d3.max(data_.map(d => parseFloat(d[QYearsOfExperience])));
        var min = d3.min(data_.map(d => parseFloat(d[QYearsOfExperience])));

        lengthScale = d3.scaleLinear()
            .domain([min, max])
            .range([3, r1]);
    }
    function createSVG() {

        svg = d3.select("#svg-container").append('svg')
            .attr("width", width)
            .attr("height", height)
            .style("left", margin.left + "px")
           // .style("top", margin.top + "px")
           .append('g')
            .attr("width", width)
            .attr("height", height)
            .style("transform", 'translate(' + margin.left + 'px, ' + margin.top + 'px)')

    }

    function createShapesRadial() {
        var angle = d3.scaleLinear()
            .range([0, 360])
            .domain([0, data_.length])

        svg.att

        data_.map((d, i) => {
            var x1 = setX(angle(i), r1);
            var y1 = setY(angle(i), r1)
            var x2 = setX(angle(i), r1 - lengthScale(d[QYearsOfExperience]));
            var y2 = setY(angle(i), r1 - lengthScale(d[QYearsOfExperience]))
            d.x1 = x1;
            d.y1 = y1;
            d.x2 = x2;
            d.y2 = y2;
            d.color = color(d[QRole]);
            d.id = i;
            d.radius = circleRadius(d[QYearlyPay]);


        });

        //   console.log(data_)


        let mainGroup = svg
            .append('g')
            .attr('id', 'group-shapes');

        shapesData = mainGroup.selectAll('g')
            .data(data_)
            .enter()
            .append("g")
            .attr('cursor', 'pointer')
            .attr('transform', 'translate(' + width / 4 + ', ' + height / 2 + ')')
            .on('mouseover', function (d) {
                // shapesData.transition().duration('100').attr('opacity', 0.2)
                // d3.select(this).transition().duration('100').attr('opacity', 1)
               
            })
            // .on('mouseout', function (d) {
            //     shapesData.transition().duration('100').attr('opacity', 1)
            // })
            .style("mix-blend-mode", 'multiply');



        var path = shapesData.append('path')
            .attr('stroke', d => d.color)
            .attr('fill', 'none')
            .attr('d', (d, i) => {
                return draw_curve(d.x1, d.y1, d.x2, d.y2, curveScale(d[QYearlyPay]), d[Qgender]);
            })
            .attr('stroke-opacity', 0.7)
            .attr('stroke-linecap', 'round')
            .attr('stroke-dasharray', 'inherit')
            .attr('stroke-linecap', 'round')
        //  .style("mix-blend-mode", 'multiply');
        //.attr('opacity',0)

        var totalLength = path.node().getTotalLength();
        var circle = shapesData.append('circle')
            .attr('r', 0)
            .attr('id', d => 'center-' + d.id)
            .attr('cx', d => d.x2)
            .attr('cy', d => d.y2)
            .attr('fill', d => d.color)
            .attr('fill-opacity', 0.2)
        // .attr('stroke-opacity', 0.2)
        // .attr('stroke', d => d.color)
        // .attr('stroke-dasharray', d => scaleLearning(d[QStudySchool]))
        // .attr('stroke-width', d => d.radius)

        shapesData.append('circle').attr('r', 0)
            .attr('id', d => 'freelancer-' + d.id)
            .attr('cx', d => d.x2)
            .attr('cy', d => d.y2)
            .attr('fill', d => d.color)
            .attr('fill-opacity', 0.9);
        var learningCircle = shapesData.append('circle')
            .attr('id', d => 'secondary-circle-' + d.id)
            .attr('cx', d => d.x2)
            .attr('cy', d => d.y2)
            .attr('stroke', d => d.color)
            .attr('stroke-width', 1.5)
            .attr('fill', 'transparent')
            .attr('stroke-opacity', 0.4)
            .attr('stroke-opacity', 0.6)
            .attr('stroke-dasharray', d => scaleLearning(d[QStudySchool]))
        path
            .attr("stroke-dasharray", r1 + totalLength + " " + r1 + totalLength)
            .attr("stroke-dashoffset", r1 + totalLength)
            .transition()
            .delay((d, i) => (Math.random() * 2 + 2) * i)
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0)
            .attr('opacity', 0.5)
            .on('end', (e) => {
                d3.select('#center-' + e.id)
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(200)
                    .attr('r', d => d.radius)
                d3.select('#secondary-circle-' + e.id)
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(200)
                    .attr('r', d => d.radius + 2)

                d3.select('#freelancer-' + e.id)
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(200)
                    .attr('r', d => d["Are you a freelancer/consultant?"] === 'Yes' ? 2 : 0)

            })
        //freelancer
        // shapesData.append('circle')
        //     .attr('cx', d => d.x1)
        //     .attr('cy', d => d.y1)
        //     .attr('r', 1)
        //     .attr('opacity', d => d["Are you a freelancer/consultant?"] === 'Yes' ? 1 : 0)
        //     .attr('fill', d => d.color)
        //     .attr('fill-opacity', 0.5)


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
        var asign = 0;

        if (setSign === 'Man') {
            asign = Jx < 0 ? -2 : 2;

        } else if (setSign === 'Woman') {
            asign = Jx < 0 ? 2 : -2;
        } else {
            asign = 0
        }

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

    function createLegend(svg_, domain, variable) {
        //  console.log(domain);
        var legend = svg_.selectAll("mydots")
            .data(domain)
            .enter()
            .append('g')
            .attr('transform', (d, i) => position(d, i, 4, 100, false))
            .attr('opacity', 0.7)
            .style('cursor', 'pointer')
            .style("mix-blend-mode", 'multiply')
            .on('mouseover', d => {
                var count = 0;
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', p => {
                        var opt;
                        if(d === p[variable]){
                            opt = selectionOp
                            count++;
                        }else{
                            opt = notSelectedOp
                        }
                        return   opt;
                    })
                    updateValues(count);
            })
            .on('mouseout', d => {
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', 1)
                    updateValues(totalElements);
            })

        legend.append("circle")
            .attr('transform', 'translate(' + 10 + ',0)')
            .attr('r', 4)
            .attr("fill", d => color(d))
            .attr("stroke", d => color(d))
            .attr('fill-opacity', 0.8)
        legend
            .append("text")
            .attr("x", 23)
            .attr("y", 2)
            .style("fill", '#666')
            .text(function (d) {
                if (d === 'Leadership (Manager, Director, VP, etc)') {
                    return 'Leadership'
                } else if (d === 'None of these describe my role') {
                    return 'None of these'
                } else {
                    return d
                }
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }
    function position(d, i, c, w) {

        var h = 20;  // legend entry height
        var tx = i % c === 0 ? 0 : 10; // tx/ty are essentially margin values
        var ty = 10;
        var x = i % c * w + tx;
        var y = Math.floor(i / c) * h + ty;
        return "translate(" + x + "," + y + ")";
    }

    function legendGender() {

        var shapes = [
            {
                id: 'Man',
                path: 'M.25,9.75A9.5,9.5,0,0,1,9.75.25',
            },
            {
                id: 'Woman',
                path: 'M9.8,9.8c0-5.3-4.2-9.5-9.5-9.5',
            }, {
                id: 'Other',
                path: 'M0.2,10.2v-10',
            }
        ];

        var legend = d3.select('#legend-gender').selectAll("mydots")
            .data(shapes)
            .enter()
            .append('g')
            .attr('transform', (d, i) => {
                var w = d.id === 'Woman' ? 50 : 65;
                return position(d, i, 3, w)
            })
            .attr('opacity', 0.7)
            .style('cursor', 'pointer')
            .style("mix-blend-mode", 'multiply')
            .on('mouseover', d => {
                var count = 0;
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', p => {
                        var opt;
                        if (d.id === 'Man' || d.id === 'Woman') {
                            if(d.id === p[Qgender]){
                                opt = selectionOp
                                count++;
                            }else{
                                opt = notSelectedOp
                            }
                           
                        } else {
                            if( p[Qgender] !== 'Man' && p[Qgender] !== 'Woman'){
                                count++;
                                opt = selectionOp
                            }else{
                                opt  = notSelectedOp;
                            }
                        }
                        return opt;
                    })
                    updateValues(count);
            })
            .on('mouseout', d => {
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', 1)
            })

        legend.append('path')
            .attr('stroke', '#666')
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .style('transform', 'translateY(-5px)')
            .attr('d', function (d) { return d.path })
        legend
            .append("text")
            .attr("x", 20)
            .style("fill", '#666')
            .text(function (d) {
                return d.id
            })
            .style('transform', d => { return d.id === 'Other' ? 'translateX(-10px)' : 'translateX(0px)' })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }

    function legendYearlyPay() {
        var svg_ = d3.select('#legend-yearly-pay');
        var xCircle = 20;
        var xLabel = 50;
        var yCircle = 30;

        var valuesToShow = ['Less than $20,000', '$200k+']
        svg_
            .selectAll("legend")
            .data(valuesToShow)
            .enter()

            .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function (d) { return yCircle - circleRadius(d) })
            .attr("r", function (d) { return circleRadius(d) })
            .style("fill", "none")
            .attr("stroke", "#666")



        // Add legend: segments
        svg_
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function (d) { return xCircle })
            .attr('x2', xLabel)
            .attr('y1', function (d) { return yCircle - 2 * circleRadius(d) })
            .attr('y2', function (d) { return yCircle - 2 * circleRadius(d) })
            .attr('stroke', '#666')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        svg_
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("text")
            .attr('x', xLabel)
            .attr('y', function (d) { return yCircle - 2 * circleRadius(d) })
            .text(function (d) { return d })
            .attr('alignment-baseline', 'middle')
            .on('mouseover', d => {
                var count = 0;
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', p => {
                        var opt;
                        if(d === p[QYearlyPay]){
                            opt = selectionOp;
                            count++;
                        }else{
                            opt = notSelectedOp;
                        }
                        return opt;
                     
                    })
                    updateValues(count);
            })
            .on('mouseout', d => {
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', 1)
                    updateValues(totalElements);
            })

    }

    function legendExperience() {

        var svg_ = d3.select('#legend-experience');
        svg_.append('line')
            .attr('x1', 0)
            .attr('x2', lengthScale(40))
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke-width', 1)
            .attr('stroke', 'white')
        svg_.append('text')
            .style('pointer-events', 'none')
            .attr('transform', ' translate(' + ((lengthScale(40) / 2) - 20) + ', 15)')
            .text('years')
        svg_.append('text')
            .style('pointer-events', 'none')
            .attr('transform', ' translate(0, 15)')
            .text(0)
        svg_.append('text')
            .style('pointer-events', 'none')
            .attr('transform', ' translate( ' + (lengthScale(40) - 15) + ',15)')
            .text(40)
    }

    function legendLearning() {
        var svg_ = d3.select('#legend-learning');
        var legend = svg_.selectAll("mydots")
            .data(['Mostly Self-Taught', 'Equal Parts School and Self-Taught', 'Mostly From School (or other formal courses)'])
            .enter()
            .append('g')
            .attr('transform', (d, i) => position(d, i, 1, 100))
            .attr('opacity', 0.7)
            .style('cursor', 'pointer')
            .style("mix-blend-mode", 'multiply')
            .on('mouseover', d => {
                var count =0;
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', p => {
                        var opt;
                        if( d === p[QStudySchool] ){
                            opt =selectionOp;
                            count++;
                        }else{
                            opt = notSelectedOp;
                        }
                        return opt;

                    })
                    updateValues(count);
            })
            .on('mouseout', d => {
                shapesData
                    .transition()
                    .duration(100)
                    .attr('opacity', 1)
                    updateValues(totalElements);
            })

        legend.append('circle')
            .attr('r', 3)
            .attr('id', d => 'legend-center-' + d.id)
            .attr('cx', 5)
            .attr('cy', 0)
            .attr('fill', 'white')
            .attr('fill-opacity', 0.2)


        legend.append('circle').attr('r', 6)
            .attr('stroke', 'white')
            .attr('cx', 5)
            .attr('cy', 0)
            .attr('stroke-width', 1)
            .attr('fill', 'transparent')
            .attr('stroke-opacity', 0.4)
            .attr('stroke-opacity', 0.6)
            .attr('stroke-dasharray', d => scaleLearning(d))
        legend
            .append("text")
            .attr("x", 20)
            .style("fill", '#666')
            .text(function (d) {
                return d
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
    }

    function updateValues(value){
        d3.select('#current-selection').html(value)
    }
});

