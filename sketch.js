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
 * @type {{metronome: any, strong: any}}
 */
const sounds = {};

function preload() {
    // let metro = loadSound("./bass_short.mp3");
    // let strong = loadSound("./metronome_short.mp3");
    // sounds.strong = strong;
    // sounds.metronome = metro;
}

/**
 * @type {Circle}
 */
let beatcircle;

function startPlaying() {
    alert("O som ainda não funciona 😥");
}

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
    // sounds.metronome.play()
}

function updateMetronome(metro_inc) {
    console.log("Metronome", metronome);
    metro_inc = metro_inc ? metro_inc : 0;
    metronome.value = Math.max(0, metronome.value + metro_inc);
    select("#metronomeDisplay").html(metronome.value);
    clearInterval(metronome.interval);
    metronome.interval = setInterval(() => {
        beatcircle.update();
    }, 1000 / (metronome.value / 60) / beatcircle.period);
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
         * @type {{ x: number, y: number, angle: number, strong: bool}[]}
         */
        this.divisions = this.generate_divisions();
        this.pointer = 0;
        this.highlightTimer = 0;
    }

    update() {
        this.highlightTimer = 15;
        this.incPointer();
        // sounds.metronome.play();
    }

    incPointer() {
        this.pointer = (this.pointer + 1) % this.period;
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
            let { x, y } = this.point_at_angle(angle, 0);
            if (i == 0) {
                return { x, y, angle, strong: true };
            }
            return { x, y, angle, strong: false };
        });
    }

    /**
     * 
     * @param {boolean} beat 
     * @param {boolean} strong 
     * @returns {[number, number]} [beat_distance_increment, radius_increment]
     */
    config(beat,strong) {
        if (beat && strong) {
            return [20, 27];
        } else  if (beat && !strong) {
            return [20, 8]

        }

        return [0, 0];
    }

    render() {
        stroke(255);
        strokeWeight(2);
        fill(0);
        // circle(this.center.x, this.center.y, this.radius);

        strokeWeight(5);

        this.divisions.forEach((p, i) => {
            let [bi, ri] = this.config(
                this.pointer == i && this.highlightTimer > 0,
                p.strong
            );
            let radius = 15 + ri;
            let beat_distance = 30 + bi;
            let line_len = 30;

            // if (this.pointer == i) {
            //     if (this.highlightTimer === 5) {
            //         if (p.strong) {
            //             sounds.strong.play();
            //         } else {
            //             sounds.metronome.play();
            //         }
            //     } else if (this.highlightTimer === 3) {
            //         sounds.strong.stop()
            //         sounds.metronome.stop();
            //     }
            // }

            let [_, outerr] = this.line_at_period(i, beat_distance, 0);
            if (p.strong) {
                stroke(255, 0, 0);
            }
            circle(outerr.x, outerr.y, radius);
            if (p.strong) {
                strokeWeight(6);
                stroke(255, 0, 0);
            }
            let [inner, outer] = this.line_at_period(i, line_len, -35);
            line(inner.x, inner.y, outer.x, outer.y);
            stroke(255);
            strokeWeight(5);
        });
        this.highlightTimer = Math.max(this.highlightTimer - 1, 0);
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

function draw() {
    background(0);
    beatcircle.setPeriod(tempo[slider.value()]);
    beatcircle.render();
}
