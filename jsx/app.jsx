const React = require("react");
const ReactDOM = require("react-dom");
const { Router, Route, browserHistory } = require("react-router");
const { Checkout } = require("./checkout.jsx");
const ErrorBundle = require("./errorBundle.jsx");
const AnimationCircle = require("./animationCircle.jsx");

let cartItems = [];

// Описание структуры колонок даннных (имя, видимость)
// Описание структуры колонок даннных (имя, видимость)
const ColumnStruct = (function () {
  let columnToResult,
    ColumnsStruct = [];
  return function (type) {
    switch (type) {
      case "clear":
        ColumnsStruct = [];
        return ColumnsStruct;
      case "add":
        let element = arguments[1];
        if (!ColumnsStruct.filter((obj) => obj.hasOwnProperty(Object.keys(element)[0])).length) {
          ColumnsStruct = [...ColumnsStruct, element];
        }
        return ColumnsStruct;
      case "getVisible":
        columnToResult =
          arguments[1] === undefined
            ? [...ColumnStruct]
            : arguments[1] instanceof Array
              ? [...arguments[1]]
              : [...ColumnStruct];
        // return columnToResult.filter((obj) => !obj[`${Object.keys(obj)[0]}`].disabled).map((el) => Object.keys(el)[0]);
        return columnToResult.filter((obj) => !obj[`${Object.keys(obj)[0]}`].disabled);
      case "get":
        return ColumnsStruct;
      case "exclude column":
        columnToResult =
          arguments[1] === undefined
            ? [...ColumnStruct]
            : arguments[1] instanceof Array
              ? [...arguments[1]]
              : [...ColumnsStruct];
        let clmnName = arguments[1].split(",");
        return columnToResult.filter((obj) => {
          for (let [k, v] of Object.entries(obj)) {
            if (clmnName.findIndex((x) => x === k) >= 0) return false;
          }
          return true;
        });
      case "get_structure": {
        return async function () {
          let url;
          url = location.origin + "/get_structure";
          try {
            let data = await fetch(url);
            data = await data.json();
            ColumnStruct("clear");
            for (let [k, v] of Object.entries(data)) {
              let obj = {};
              obj[`${k}`] = v;
              ColumnStruct("add", obj);
            }
            return ColumnStruct("get");
          } catch (e) {
            return ColumnStruct("clear");
          }
        };
      }
      case "get_reklama":
        return async function () {
          let url;
          url = location.origin + "/get_reklama";
          try {
            data = [];
            let response = await fetch(url);
            data = await response.json();
            return data;
          } catch (e) {
            return {};
          }
        };
      case "get_basketSale_itog_style":
        return async function () {
          let url;
          url = location.origin + "/get_basketSale_itog_style";
          try {
            let data = await fetch(url);
            data = await data.json();
            return data;
          } catch (e) {
            return {};
          }
        };
    }
  };
})();

async function getPreOrder(hash = "pre_order") {
  let url = new URL(`${location.origin}/${hash}`);
  try {
    let response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    console.log(response.ok);
    if (!response.ok) {
      cartItems = Array.from([]);
      return cartItems;
    } else {
      let data = await response.json();
      console.log("data", typeof data, data);
      if (Object.keys(data).length) {
        if (/^pre_order/.test(hash)) {
          //  data = Object.entries(data).sort((x, y) => y[1].dataRow.Active - x[1].dataRow.Active);
          let arr = Array.from(
            Object.entries(data).reduce((prev, cur) =>
              prev[0] < cur[0] ? Array.of(...cur, ...prev) : Array.of(...prev, ...cur),
            ),
          );
          arr = arr
            .reduce(
              (prev, cur, index) => (index % 2 ? Array.of(...prev, [arr[index - 1], cur]) : Array.of(...prev)),
              [],
            )
            .map((cur) => {
              let length = cartItems.filter((prev) => prev[0] === cur[0] && prev[1].count !== cur[1].count).length;
              if (length > 0) {
                cur[1].dataRow.Active = length;
              }
              cur[1].dataRow.Active = length;
              return cur;
            })
            .reduce((prev, cur) => (cur[1].dataRow.Active ? [cur, ...prev] : [...prev, cur]), []);
          cartItems = Array.from(arr);
        } else {
          return Object.entries(data).map((el) => {
            let o = {};
            o[`${el[0]}`] = el[1];
            return Object.assign(o);
          });
        }
      } else cartItems = Array.from([]);
      return cartItems;
    }
  } catch (e) {
    console.log(e);
    //return {};
    return Array.from([]);
  }
}

// главный компонент, потому что он является точкой входа для Webpack
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { columnName: null, updateParent: false, reklama: {}, basketSale_itog_style: {} };
    this.initStructureColumn = this.initStructureColumn.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
  }

  async initStructureColumn() {
    let columnName = await ColumnStruct("get_structure");
    columnName = await columnName();
    let reklama = await ColumnStruct("get_reklama");
    reklama = await reklama();
    columnName = ColumnStruct("getVisible", ColumnStruct("exclude column", "Описание"));
    let basketSale_itog_style = await ColumnStruct("get_basketSale_itog_style");
    basketSale_itog_style = await basketSale_itog_style();
    this.setState({ columnName, reklama, basketSale_itog_style });
  }

  componentDidMount() {
    this.initStructureColumn();
  }

  handleUpdate() {
    this.setState({ updateParent: !this.state.updateParent });
  }

  render() {
    let { columnName, reklama, basketSale_itog_style } = this.state;
    let style = cartItems.length ? {} : { background: "transparent" };
    return columnName ? (
      <div
        className='well'
        style={{ ...style }}>
        <Checkout
          cartItems={getPreOrder}
          columnName={columnName}
          interval={interval}
          ColumnStruct={ColumnStruct}
          handleUpdate={this.handleUpdate}
          reklama={reklama}
          basketSale_itog_style={basketSale_itog_style}
        />
      </div>
    ) : (
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

ReactDOM.render(
  <Router history={browserHistory}>
    <Route
      path='/'
      component={App}></Route>
  </Router>,
  document.getElementById("content"),
);
