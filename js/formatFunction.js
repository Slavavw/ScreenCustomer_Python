/* конвертировать вещественное значение, если там запятая в вещественное с точкой  */
const convertToNumeric = (val) => {
  let regEx = /(?<coma>\,)/g;
  return String(val).replace(regEx, (simb) => {
    let s = "";
    switch (simb) {
      case ",":
        s = ".";
    }
    return s;
  });
};

let getBYN = (type, ...val) => {
  let res = val
    .map((el) => convertToNumeric(String(el)))
    .reduce((prev, cur) => {
      switch (type) {
        case "+":
          return Math.fround(prev) + Math.fround(cur);
        case "-":
          return Math.fround(prev) - Math.fround(cur);
        case "/":
          return prev / cur;
        case "*":
          return prev * cur;
        default:
          return prev;
      }
    });

  res;

  let cop = /(?<RUB>\d*)(\.|\,)?(?<KOP>\d{0,10})/i.exec(res);
  if (cop === null) {
    return { RUM: "0", KOP: "00" };
  }
  let { RUB, KOP } = cop.groups;
  KOP = KOP.concat("0");
  KOP = Math.abs(KOP.slice(0, 2)) + Math.abs(Math.round(KOP.slice(2, 8) / 10 ** KOP.slice(2, 8).length));
  KOP =
    String(KOP / 100).split(".").length === 1
      ? "00"
      : String(KOP / 100)
          .split(".")[1]
          .concat(String(KOP / 100).split(".")[1].length === 1 ? "0" : "");
  return { RUB, KOP };
};

const regExpClient = /(?<table>\d+)_(?<phone>\+(\d|\s)+)[\s|_]*?_(?<user>[A-Z,А-Я,0-9]+)[\s|_]*(?<htmlOrder>\d+)*/i;
//const regExpClient = /(?<table>\d+)_(?<phone>\+(\d|\s)+)[\s|_]*?_(?<user>[A-Z,А-Я]+)/i;

module.exports = { convertToNumeric, getBYN, regExpClient };
