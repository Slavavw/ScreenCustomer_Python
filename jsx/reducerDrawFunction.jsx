const varibleVal = () => "0bf0bf0bf";
const getMask = (mask = "#hhhhhh") => mask;
const getRandomVal = (mask) => {
  let length = mask.match(/[^#]/g).length;
  let arr = Array.from({ length }, (_, index) => (randomIndex = Math.floor(Math.random() * length)));
  return Array.of(...mask.match(/#/g), ...arr);
};

const generateRundomColor = (array) => {
  let color = array.map((el) => (el !== "#" ? varibleVal().split("")[el] : el));
  return color.join("");
};

const compose =
  (...func) =>
  (arg) =>
    func.reduce((composed, f) => f(composed), arg);

function gradientColor(init = 0, color, context) {
  return function (x, y, r) {
    let gradient = context.createLinearGradient(x - r, y - r, x + r, y + r);
    //let gradient = context.createLinearGradient(0, 0, context.canvas.width, context.canvas.height);
    init += 0.1;
    init = init > 1 ? 0 : init;

    let colorNew = compose(getMask, getRandomVal, generateRundomColor)();

    gradient.addColorStop(init, compose(getMask, getRandomVal, generateRundomColor)());
    gradient.addColorStop(Math.random(), compose(getMask, getRandomVal, generateRundomColor)());
    gradient.addColorStop(Math.random(), compose(getMask, getRandomVal, generateRundomColor)());
    gradient.addColorStop(Math.random(), compose(getMask, getRandomVal, generateRundomColor)());
    gradient.addColorStop(Math.random(), compose(getMask, getRandomVal, generateRundomColor)());
    return gradient;
  };
}

function changeCoordinate(arg) {
  let { x, y, width, height, radius } = arg;
  let randomX = Math.random() * (width - radius);
  let randomY = Math.random() * (height - radius);
  x = randomX;
  y = randomY;
  return { ...arg, x, y };
}

function erase_frame(arg) {
  let { width, height, canvas } = arg;
  canvas.width = width;
  canvas.height = height;
  //context.clearRect(x - radius, y - radius, x + radius, y + radius);
  return { ...arg };
}

function draw_circle(arg) {
  let { x, y, radius, context } = arg;
  context.fillStyle = this.getGradientToFill(x, y, radius);
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, true);
  context.fill();
  return { x, y };
}

module.exports = { compose, erase_frame, changeCoordinate, draw_circle, gradientColor };
