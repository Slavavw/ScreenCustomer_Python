const React = require("react");
const { findDOMNode: fndDOM } = require("react-dom");
const { compose, erase_frame, changeCoordinate, draw_circle, gradientColor } = require("./reducerDrawFunction.jsx");

class AnimationCircle extends React.Component {
  constructor(props) {
    super(props);
    this.state = { timer: 0 };
    this.timer = null;
    let obj = Object.assign({}, AnimationCircle.defaultProps);
    for (let [key, val] of Object.entries(obj)) {
      this[`${key}`] = (props.route && props.route[`${key}`]) || props[`${key}`] || val;
    }
    this.speed = (props.route && props.route.speed) || props.speed || 1000 / 25;
  }

  componentDidMount() {
    this.getGradientToFill = gradientColor(0.1, this.color, fndDOM(this.refs.canvas_animation).getContext("2d"));
    this.timer = setInterval(() => this.setState({ timer: this.state.timer + 1 }), this.speed);
  }
  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.timer !== nextState.timer) {
      let mycanvas = fndDOM(this.refs.canvas_animation),
        mycontext = mycanvas.getContext("2d");
      let newCoord = compose(
        erase_frame,
        changeCoordinate,
        draw_circle.bind(this)
      )({
        context: mycontext,
        canvas: mycanvas,
        width: this.props.width,
        height: this.props.height,
        x: this.x,
        y: this.y,
        radius: this.radius,
      });
      for (let key in newCoord) {
        if (this[`${key}`]) this[`${key}`] = newCoord[`${key}`];
      }
      //if (nextState.timer === 1000) clearInterval(this.timer);
    }
    return true;
  }
  render() {
    return (
      <canvas
        id='animation-circle'
        width={this.width}
        height={this.height}
        ref='canvas_animation'
        style={this.props.style && { ...this.props.style }}
      />
    );
  }
}

AnimationCircle.defaultProps = {
  width: 400,
  height: 200,
  x: 50,
  y: 50,
  radius: 25,
  color: "#16ff",
};

module.exports = AnimationCircle;
