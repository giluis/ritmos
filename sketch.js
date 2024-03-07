let slider;
const tempo = [1, 2, 3, 4, 6, 8];
const metronome = {
    value: 60,
    increment: 0,
    interval: setInterval((_) => {
        // do nothing
    }, 10000),
};

/**
 * @type {Circle}
 */
let beatcircle;

function setup() {
    const cnv = createCanvas(windowWidth, 1200);
    cnv.parent("beats");
    background(0);
    slider = createSlider(0, 5, 4, 1);
    slider.parent("control");
    slider.id("myslider");
    beatcircle = new Circle(width / 2, height / 2, 450, tempo[slider.value()]);
    let buttons = selectAll(".metronomeButton");
    for (const b of buttons) {
        // console.log(b.html());
        b.mousePressed(updateMetronome.bind(null, parseInt(b.html())));
    }
    updateMetronome(0);
}

function updateMetronome(metro_inc) {
    metro_inc = metro_inc ? metro_inc : 0;
    metronome.value = Math.max(0, metronome.value + metro_inc);
    select("#metronomeDisplay").html(metronome.value);
    metronome.increment = (2 * PI) / (60 * (60 / metronome.value));
}

let a = 0;

/**
 *
 * @param {number} limit
 * @returns {number[]}
 */
function range(limit) {
    return [...Array(limit).keys()];
}

class Circle {
    /**
     *
     * @param {number} center_x
     * @param {number} center_y
     * @param {number} radius
     * @param {number} period
     */
    constructor(center_x, center_y, radius, period) {
        this.center = { x: center_x, y: center_y };
        this.radius = radius;
        this.period = period;
        /**
         * @type {{ x: number, y: number, angle: number, strong: bool}[]}
         */
        this.divisions = this.generate_divisions();
        this.pivot = {
            division: 0,
            angle: 0 - PI/2,
            passthrough: false,
        };
    }

    

    update(increment) {
        this.pivot.passthrough = false;
        this.pivot.angle += increment;
        if (this.pivot.angle % (PI * 2) < this.divisions[this.pivot.division]) {
        };

        if (
            this.pivot.angle % (PI * 2) >
            this.divisions[(this.pivot.division + 1) % this.period].angle %
                (PI * 2)
            
        ) {
            this.pivot.division += 1 ;
            this.pivot.division %= this.period;
            this.pivot.passthrough = true;
            // console.log(this.pivot.passthrough )
        }
    }

    /**
     *
     * @param {number} angle
     * @param {number} distance_from_circumference
     */
    point_at_angle(angle, distance_from_circumference) {
        return {
            x:
                this.center.x +
                ((this.radius + distance_from_circumference) * cos(angle)) / 2,
            y:
                this.center.y +
                ((this.radius + distance_from_circumference) * sin(angle)) / 2,
        };
    }

    /**
     *
     * @param {number} idx
     */
    toggle_strong_at(idx) {
        this.divisions[idx].strong = !this.divisions[idx].strong;
    }

    /**
     * Period period is the number of divisions that the circle will have
     * n is the index of the division.
     * subtraction of PI/2 happens because divisions should
     * always start on top of the circle, rather than on the right of the circle,
     * as is typical in trignometric circles
     * @param {number} n
     * @returns {number}
     */
    angle_at_period(n) {
        return ((n % this.period) * (2 * PI)) / this.period - PI / 2;
    }

    /**
     *
     * @param {number} n
     * @param {number} line_len
     * @returns {[number,number]}
     */
    line_at_period(n, line_len, distance_from_circumference) {
        let angle = this.angle_at_period(n);
        let inner_point = this.point_at_angle(
            angle,
            -line_len / 2 + distance_from_circumference
        );
        let outer_point = this.point_at_angle(
            angle,
            +line_len / 2 + distance_from_circumference
        );
        return [inner_point, outer_point];
    }

    generate_divisions() {
        return range(this.period).map((i) => {
            let angle = this.angle_at_period(i);
            // sub PI/2 so that the first division is the top most one, rather than the right most
            let { x, y } = this.point_at_angle(angle - PI/2, 0);
            return { x, y, angle, strong: false };
        });
    }

    render() {
        stroke(255);
        strokeWeight(2);
        fill(0);
        // circle(this.center.x, this.center.y, this.radius);

        strokeWeight(5);
        let point = this.point_at_angle(0 + this.pivot.angle, 0);
        let pivot_radius = 10;
        if (this.pivot.passthrough) {
            pivot_radius = 20;

        }

        circle(point.x, point.y, pivot_radius);

        this.divisions.forEach((p, i) => {
            let line_len = 30;
            let radius = 15;
            if (p.strong) {
                stroke(255, 0, 0);
                strokeWeight(7);
                line_len = 50;
                radius = 25;
            }
            let [inner, outer] = this.line_at_period(i, line_len, -35);
            line(inner.x, inner.y, outer.x, outer.y);
            stroke(255);
            strokeWeight(5);
        });
    }

    /**
     *
     * @param {number} period
     */
    setPeriod(period) {
        if (period < 0) {
            throw "period must be greater than 0";
        }
        if (period != this.period) {
            this.period = period;
            console.log("cleared");
            this.divisions = this.generate_divisions();
            // this.points.forEach((p, i) => {
            //     console.log(`Point: (${p.x}, ${p.y})`);
            //     if (dist(mouseX, mouseY, p.x, p.y) < 50) {
            //         beatcircle.toggle_strong_at(i);
            //     }
            // });
        }
    }
}

function mouseClicked() {
    beatcircle.divisions.forEach((p, i) => {
        // console.log(`
        // 	mouse: {x: ${mouseX}, y: ${mouseY}},
        // 	point: {x: ${p.x}, y: ${p.y}},
        // 	dist: ${dist(mouseX, mouseY, p.x, p.y)},

        // `);
        if (dist(mouseX, mouseY, p.x, p.y) < 50) {
            beatcircle.toggle_strong_at(i);
        }
    });
}

let b = 0;
let c = true;

function draw() {
    frameRate(60);
    background(0);
    beatcircle.setPeriod(tempo[slider.value()]);
    beatcircle.update(metronome.increment);
    beatcircle.divisions[frameCount % beatcircle.period].beat = true;
    beatcircle.divisions[(frameCount - 1) % beatcircle.period].beat = false;
    // beatcircle.toggle_strong_at(frameCount % beatcircle.period);
    beatcircle.render();
    // beatcircle.velocity = 2*PI / frameRate() * (120 / frameRate() );
}

