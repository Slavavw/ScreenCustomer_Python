const React = require("react");
const { gradientColor } = require("./reducerDrawFunction.jsx");
const { findDOMNode } = require("react-dom");

class ErrorBundle extends React.Component {
  constructor(props) {
    super(props);
    this.message = props.message || "No connection..";
  }
  componentDidMount() {
    let context = findDOMNode(this.refs["error-canvas"]).getContext("2d");
    let fontSize = 30;
    context.font = `${fontSize}px Arial`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    while (context.measureText(`${this.message}`).width > this.props.width) {
      fontSize--;
      context.font = `${fontSize}px Arial`;
    }
    context.strokeText(`${this.message}`, 100, 20);
    context.fillStyle = gradientColor(1, null, context)(0, 0, this.props.width);
    context.fillText(`${this.message}`, 100, 20);
  }
  render() {
    let { width, height } = this.props;
    return (
      <article>
        <canvas
          ref={"error-canvas"}
          width={width}
          height={height}></canvas>
        {this.props.children}
      </article>
    );
  }
}

module.exports = ErrorBundle;
