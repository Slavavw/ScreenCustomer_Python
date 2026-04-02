const React = require("react");
const { findDOMNode } = require("react-dom");
const ItcSlider = require("../js/sliderLibrery.js");

class CItcSlider extends React.Component {
  constructor(props) {
    super(props);
    this.reklama = [];
    this.sliderWidth = 0;
  }

  componentWillMount() {
    this.reklama = this.props.reklama;
    if (this.reklama.length < 3) {
      this.reklama = Array.from([...this.reklama, ...this.reklama.slice(0, 2)]);
    }
  }

  componentDidMount() {
    if (this.reklama.length) {
      let { width, height } = findDOMNode(this.refs["slider-container"]).parentElement.getBoundingClientRect();
      this.sliderWidth = width > 743 ? this.props.sliderWidth : width - 40;
      let { loop, autoplay, interval, refresh, swipe } = this.props;
      if (this.reklama.length) {
        ItcSlider.getOrCreateInstance(findDOMNode(this.refs["itc-slider"]), {
          autoplay,
          interval,
          loop,
          refresh,
          swipe,
        });
      } else {
        document.querySelectorAll(".itc-slider-btn").forEach((item) => {
          item.classList.add("itc-slider-btn-hide");
        });
      }

      let el = findDOMNode(this.refs["itc-slider"]);
      ItcSlider.getOrCreateInstance(el);
    }
  }

  render() {
    let reklama = this.reklama,
      { sliderHeight } = this.props,
      sliderWidth = this.sliderWidth;
    return reklama.length ? (
      <div
        id='slider-container'
        ref='slider-container'
        style={{
          width: `${sliderWidth}px`,
          height: `${sliderHeight}px`,
          margin: "1rem auto",
          padding: "0",
          background: "transparent",
        }}>
        <div
          className='itc-slider'
          ref='itc-slider'>
          <div className='itc-slider-wrapper'>
            <div className='itc-slider-items'>
              {reklama.map((src, index) => {
                let url = new URL(`${location.href}${src}`);
                return (
                  <div
                    key={index}
                    className='itc-slider-item'
                    ref='itc-slider-item'
                    style={{
                      width: `${sliderWidth}px`,
                      height: `${sliderHeight}px`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "contain",
                      backgroundPosition: "center center",
                      borderRadius: "50px 0",
                      backgroundImage: `url(${url})`,
                    }}></div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}

CItcSlider.defaultProps = {
  loop: true,
  autoplay: true,
  interval: 2000,
  refresh: true,
  swipe: true,
  sliderWidth: 736,
  sliderHeight: 432,
};

module.exports = CItcSlider;
