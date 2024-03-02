let slider;
const tempo = [1, 2, 3, 4, 6, 8];
let metronome;
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
	
}

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
         * @type {{strong: boolean, beat: boolean, x: number, y: number}[]}
         */
        this.points = this.generate_points();
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
        this.points[idx].strong = !this.points[idx].strong;
    }

    /**
     * Period period is the number of divisions that the circle will have
     * n is the index of the division.
     * subtraction of PI/2 happens because divisions should
     * always start on top of the circle, rather than on the right of the circle,
     * as is typical in trignometric circles
     * @param {number} n
     */
    angle_at_period(n) {
        return ((n % this.period) * (2 * PI)) / this.period - PI / 2;
    }

    /**
     *
     * @param {number} n
     * @param {number} line_len
     * @returns
     */
    line_at_period(n, line_len) {
        let angle = this.angle_at_period(n);
        let inner_point = this.point_at_angle(angle, -line_len / 2);
        let outer_point = this.point_at_angle(angle, +line_len / 2);
        return [inner_point, outer_point];
    }

    generate_points() {
        return range(this.period).map((i) => {
            let angle = this.angle_at_period(i);
            let { x, y } = this.point_at_angle(angle, 0);
            return { x, y, strong: false, beat: false };
        });
    }

    render() {
        stroke(255);
        strokeWeight(5);
        fill(0);
        circle(this.center.x, this.center.y, this.radius);
        this.points.forEach((p, i) => {
            let line_len = 30;
            let radius = 15;
            if (p.strong) {
                stroke(255, 0, 0);
                strokeWeight(7);
                line_len = 50;
                radius = 25;
            }

            if (p.beat) {
                circle(p.x, p.y, radius);
            } else {
                let [inner, outer] = this.line_at_period(i, line_len);
                line(inner.x, inner.y, outer.x, outer.y);
            }
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
            this.points = this.generate_points();
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
    beatcircle.points.forEach((p, i) => {
        // console.log(`
        // 	mouse: {x: ${mouseX}, y: ${mouseY}},
        // 	point: {x: ${p.x}, y: ${p.y}},
        // 	dist: ${dist(mouseX, mouseY, p.x, p.y)},

        // `);
        if (dist(mouseX, mouseY, p.x, p.y) < 50) {
            console.log(`Clicked on ${i}`);
            beatcircle.toggle_strong_at(i);
        }
    });
}

function draw() {
    frameRate(5);
    background(0);
    beatcircle.setPeriod(tempo[slider.value()]);
	beatcircle.points[frameCount%beatcircle.period].beat = true;
	beatcircle.points[(frameCount - 1 )%beatcircle.period].beat = false ;
    // beatcircle.toggle_strong_at(frameCount % beatcircle.period);
    beatcircle.render();

}
