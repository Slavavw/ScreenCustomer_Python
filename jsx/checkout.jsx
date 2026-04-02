const React = require("react");
const { getBYN, convertToNumeric } = require("../js/formatFunction.js");
const ErrorBundle = require("./errorBundle.jsx");
const AnimationCircle = require("./animationCircle.jsx");
const CItcSlider = require("./ItcSlider.jsx");

class Checkout extends React.Component {
  constructor(props) {
    super(props);
    this.createTotalColumn = this.createTotalColumn.bind(this);
    this.senderRequest = this.senderRequest.bind(this);
    this.TotalColumn = {};
    this.numberInterval = null;
    this.checkForUpdate = this.checkForUpdate.bind(this);
    this.state = { error: "", cartItems: [], cartHeader: [], focus: false };
  }

  componentWillMount() {
    let { cartItems } = this.props.route || this.props;
    Promise.all([cartItems()]).then((result) => {
      this.setState({ cartItems: result[0] });
    });
  }

  checkForUpdate(newCartItems, cartItems) {
    for (let [key, val] of newCartItems) {
      if (!cartItems.filter((el) => el[0] === key).length) {
        newCartItems = Array.from(
          newCartItems.map((el) => {
            if (el[0] === key) {
              el[1].dataRow.Active = true;
            }
            return el;
          }),
        );
        return true;
      }
      if (cartItems.filter((el) => el[0] === key)[0][1].count !== val.count) {
        cartItems = Array.from(
          cartItems.map((el) => {
            if (el[0] === key) {
              el[1].dataRow.Active = true;
            }
            return el;
          }),
        );
        return true;
      }
      cartItems = Array.from(
        cartItems.map((el) => {
          if (el[0] === key) {
            el[1].dataRow.Active = false;
          }
          return el;
        }),
      );
    }
    return false;
  }

  async senderRequest() {
    let { cartItems, handleUpdate } = this.props.route || this.props;
    let newCartItems = await cartItems();
    if (newCartItems.length) {
      if (
        this.checkForUpdate(newCartItems, this.state.cartItems) ||
        this.checkForUpdate(this.state.cartItems, newCartItems)
      ) {
        let cartHeader = await cartItems("headerpre_order");
        this.setState({ cartItems: newCartItems, cartHeader }, () => handleUpdate());
      }
    } else {
      this.setState({ cartItems: [] }, () => handleUpdate());
    }
  }

  componentWillReceiveProps(newProps) {
    let { cartItems } = this.state;
    if (cartItems.filter((el) => el[1].dataRow.Active).length) {
      let _that = this;
      new Promise((resolve) => {
        _that.setState({ focus: true }, () => {
          setTimeout(resolve, 1000);
        });
      }).then(() => {
        _that.setState({ focus: false });
      });
    } else return true;
  }

  componentDidMount() {
    let { interval } = this.props.route || this.props;
    this.numberInterval = window.setInterval(this.senderRequest, interval);
  }

  createTotalColumn = (key, value) => {
    this.TotalColumn[key] = value * 1 + (this.TotalColumn[key] === undefined ? 0 : this.TotalColumn[key]) * 1;
  };

  componentWillUnmount() {
    if (this.numberInterval) {
      window.clearInterval(this.numberInterval);
    }
  }

  render() {
    let { cartItems, cartHeader } = this.state;
    cartItems = Array.from(cartItems.flat().filter((el, index) => index % 2));
    let { columnName, reklama, basketSale_itog_style } = this.props.route || this.props;
    let { focus, error } = this.state;
    if (error === "") {
      this.TotalColumn = Object.assign({});
      if (cartItems.length) {
        cartItems.map((item, index) => {
          let { dataRow, count } = item;
          columnName
            .map((el) => Object.keys(el)[0])
            .map((title, i) => {
              if (Object.hasOwn(dataRow, title)) {
                if (/сумма со скидкой/is.exec(title) !== null) {
                  this.createTotalColumn(`Итого по чеку `, convertToNumeric(dataRow[`${title}`]));
                }
              }
            });
        });
        return (
          <div>
            <TBasketSale_itogo
              TotalColumn={this.TotalColumn}
              cartHeader={cartHeader}
              basketSale_itog_style={basketSale_itog_style}
            />
            <table
              className='table table-bordered'
              ref={"table table-bordered"}
              style={{ background: "rgba(125,125,125,.8)" }}>
              <colgroup>
                {columnName
                  .map((el) => Object.keys(el)[0])
                  .map((title, i) => {
                    if (/\.?изделие|продукт\.?|\.?цена|стоимость|сумма\.?/is.exec(title) !== null)
                      return (
                        <col
                          id={title}
                          key={i}
                        />
                      );
                    else if (/PHOTO|src/i.exec(title))
                      return (
                        <col
                          id={title}
                          key={i}
                        />
                      );
                    else return null;
                  })}
              </colgroup>
              <tbody>
                <tr>
                  {columnName
                    .map((el) => Object.keys(el)[0])
                    .map((title, i) => {
                      let { font, color, textDecoration, fontWeight, fontStyle, rowsBkground } = columnName.filter(
                        (el) => Object.keys(el)[0] === title,
                      )[0][`${title}`].HeaderStyle;
                      let addStyle = {
                        font,
                        color,
                        textDecoration,
                        fontWeight,
                        fontStyle,
                        backgroundColor: rowsBkground,
                      };
                      title = /PHOTO|src/i.exec(title) ? "" : title;
                      if (/изделие/i.test(title)) {
                        return (
                          <th
                            scope='col'
                            key={i}
                            style={{ verticalAlign: "middle", ...addStyle }}>
                            {title}
                          </th>
                        );
                      }
                      if (/количество/i.test(title)) {
                        return (
                          <th
                            scope='col'
                            key={columnName.length + 100}
                            style={{ textAlign: "center", verticalAlign: "middle", ...addStyle }}>
                            количество
                          </th>
                        );
                      }
                      return (
                        <th
                          scope='col'
                          key={i}
                          style={{ textAlign: "center", verticalAlign: "middle", ...addStyle }}>
                          {title}
                        </th>
                      );
                    })}
                </tr>
                {cartItems.map((item, index) => {
                  let { dataRow, count } = item;
                  let style = dataRow["Active"] && focus ? {} : {};
                  return (
                    <tr
                      key={index}
                      style={{
                        padding: "2px",
                        color: "black",
                        background: "rgb(0, 102, 153)",
                        border: "none",
                        borderRadius: "5px",
                        boxShadow: "0 0 2px white",
                        ...style,
                      }}>
                      {columnName
                        .map((el) => Object.keys(el)[0])
                        .map((title, i) => {
                          let { font, color, textDecoration, fontWeight, fontStyle, rowsBkground } = columnName.filter(
                            (el) => Object.keys(el)[0] === title,
                          )[0][`${title}`];
                          let addStyle = !(dataRow["Active"] && focus)
                            ? {
                                transitionProperty: "background, boxShadow, fontSize",
                                transitionDuration: ".5s",
                                background: "rgb(0,102,153)",
                                boxShadow: "0 0 2px white",
                                font,
                                color,
                                textDecoration,
                                fontWeight,
                                fontStyle,
                                backgroundColor: rowsBkground,
                              }
                            : {
                                color: "#ffffff",
                                background: "linear-gradient(rgb(39 161 41 / 77%) 40%, rgb(90 203 62 / 50%))",
                                boxShadow: "inset 4px 4px rgba(10,10,10,.1)",
                                boxShadow: "rgba(10, 10, 10, 0.1) 4px 4px inset",
                                transform: "scale(1.01)",
                                fontSize: "1.2em",
                                fontWeight: "bold",
                              };
                          return /количество/i.test(title) ? (
                            <td
                              style={{ textAlign: "center", verticalAlign: "middle", ...addStyle }}
                              key={i}>
                              {count}
                            </td>
                          ) : (
                            <TTD
                              key={i}
                              title={title}
                              dataRow={dataRow}
                              count={count}
                              addStyle={addStyle}
                              createTotalColumn={this.createTotalColumn}></TTD>
                          );
                        })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      } else {
        return <CItcSlider reklama={reklama}></CItcSlider>;
      }
    } else {
      return (
        <ErrorBundle
          width={200}
          height={100}
          message={this.state.error}>
          <AnimationCircle
            width={500}
            height={100}
            style={{ position: "absolute", left: 50, zIndex: "-10000" }}
            speed={1000 / 24}
          />
        </ErrorBundle>
      );
    }
  }
}

class TTD extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { dataRow, count, title, createTotalColumn, addStyle } = this.props;
    let data = dataRow[title];
    if (Object.hasOwn(dataRow, title)) {
      if (/сумма со скидкой/is.exec(title) !== null) {
        createTotalColumn(`Итого по чеку `, convertToNumeric(dataRow[`${title}`]));
      }
      if (/PHOTO|src/i.test(title))
        return (
          <td
            ref='parent'
            style={{
              backgroundImage: `url(${new URL(location + data)})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundOrigin: "border-box",
              backgroundPosition: "center center",
              width: "70px",
              height: "70px",
              margin: "0px 0px",
              padding: "0px 0px",
            }}></td>
        );
      else if (/изделие/i.test(title)) {
        return (
          <td
            ref='parent'
            style={{ verticalAlign: "middle", ...addStyle }}>
            {dataRow[`${title}`]}
          </td>
        );
      } else {
        return (
          <td
            ref='parent'
            style={{ textAlign: "center", verticalAlign: "middle", ...addStyle }}>
            {dataRow[`${title}`]}
          </td>
        );
      }
    } else return null;
  }
}

class TBasketSale_itogo extends React.Component {
  constructor(props) {
    super(props);
    this.message = "";
  }

  shouldComponentUpdate(newProps, newState) {
    let result = false;
    if (Object.entries(newProps.TotalColumn).length) {
      let [key, value] = Object.entries(newProps.TotalColumn)[0];
      let messaage = `${key} ${getBYN("*", value, 1).RUB} руб. ${getBYN("*", value, 1).KOP} коп.`;
      if (this.message !== messaage) {
        result = this.message = messaage;
      }
    }
    return result;
  }

  render() {
    let { cartHeader, basketSale_itog_style } = this.props;
    let noDisplayHearder = cartHeader.reduce(
        (prev, cur) => (/nodisplay\d/.test(Object.keys(cur)[0]) ? [...prev, Object.values(cur)[0]] : [...prev]),
        [],
      ),
      DisplayHearder = cartHeader.filter((el) => !/nodisplay\d/.test(Object.keys(el)[0]));
    return (
      <div
        className='BasketSale_itogo'
        ref='BasketSale_itogo'
        style={{ color: "red", fontWeight: "bold", ...basketSale_itog_style }}>
        <span>{this.message}</span>
        <div
          className='wrapper_header'
          style={{ display: "flex", flexFlow: "column nowrap", float: "right" }}>
          <div
            className='noDisplayHearder'
            style={{ display: "flex", flexFlow: "row nowrap" }}>
            {noDisplayHearder.map((el, i) => (
              <div
                className='element_noDisplayHearder'
                key={i}>
                {el}
              </div>
            ))}
          </div>
          <div
            className='DisplayHearder'
            style={{ display: "flex", flexFlow: "row nowrap", gap: "10px" }}>
            {DisplayHearder.map((el, i) => {
              let header = Object.keys(el)[0],
                value = Object.values(el)[0];
              return (
                <div
                  className='element_DisplayHearder'
                  style={{
                    display: "flex",
                    flexFlow: "column nowrap",
                    borderRadius: "5px",
                    padding: "10px 10px 0 10px",
                    backgroundColor: "rgba(0, 0, 0, .1)",
                    textAlign: "center",
                  }}>
                  <nav>{header}</nav>
                  <nav>{value}</nav>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

module.exports = { Checkout, TBasketSale_itogo };
