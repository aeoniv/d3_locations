        // p5.js Setup
        function setup() {
            createCanvas(window.innerWidth, window.innerHeight);
            background(183,28,28); // Set a custom background color
        }

        // Optional p5.js Animation
        function draw() {
            background(183,28,28); // Re-draw background each frame
            // You can add any p5.js drawing code here for the background effect
            noFill();
            stroke(0, 233, 255); // Soft lines for effect
            ellipse(width / 2, height / 2, 300, 300); // Example background shape
        }

        // D3 Globe Setup
        const width = window.innerWidth;
        const height = window.innerHeight;
        const config = {
            speed: 0.005,
            verticalTilt: -30,
            horizontalTilt: 0
        };
        let locations = [];
        const svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height);
        const markerGroup = svg.append('g');
        const projection = d3.geoOrthographic()
            .translate([width / 2, height / 2])
            .scale(250);
        const path = d3.geoPath().projection(projection);

        // Draw the Globe and Graticule
        drawGlobe();
        drawGraticule();
        enableRotation();

        function drawGlobe() {
            d3.queue()
                .defer(d3.json, 'https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json')
                .defer(d3.json, 'locations.json')
                .await((error, worldData, locationData) => {
                    svg.selectAll(".segment")
                        .data(topojson.feature(worldData, worldData.objects.countries).features)
                        .enter().append("path")
                        .attr("class", "segment")
                        .attr("d", path)
                        .style("stroke", "#888")
                        .style("stroke-width", "1px")
                        .style("fill", (d, i) => '#e5e5e5')
                        .style("opacity", ".6");
                    locations = locationData;
                    drawMarkers();
                });
        }

        function drawGraticule() {
            const graticule = d3.geoGraticule().step([10, 10]);
            svg.append("path")
                .datum(graticule)
                .attr("class", "graticule")
                .attr("d", path)
                .style("fill", "none")
                .style("stroke", "#ccc");
        }

        function enableRotation() {
            d3.timer(function(elapsed) {
                projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
                svg.selectAll("path").attr("d", path);
                drawMarkers();
            });
        }

        function drawMarkers() {
            const markers = markerGroup.selectAll('circle')
                .data(locations);
            markers.enter()
                .append('circle')
                .merge(markers)
                .attr('cx', d => projection([d.longitude, d.latitude])[0])
                .attr('cy', d => projection([d.longitude, d.latitude])[1])
                .attr('fill', d => {
                    const coordinate = [d.longitude, d.latitude];
                    const gdistance = d3.geoDistance(coordinate, projection.invert([width / 2, height / 2]));
                    return gdistance > 1.57 ? 'none' : 'steelblue';
                })
                .attr('r', 7);
            markers.exit().remove();
        }

        // Adjust canvas and SVG on resize
        function windowResized() {
            resizeCanvas(window.innerWidth, window.innerHeight);
            svg.attr("width", window.innerWidth).attr("height", window.innerHeight);
            projection.translate([window.innerWidth / 2, window.innerHeight / 2]);
        }

        window.addEventListener('resize', windowResized);