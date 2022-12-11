export function checkTime(hours) {
  let hour = hours;
  if (hour < 10) {
    hour = "0" + hour;
  }
  return hour;
}

export function getDateTime() {
  const date = new Date();

  let day = date.getDate();
  day = day < 10 ? "0" + day : day;

  let month = date.getMonth();
  month += 1;
  month = month < 10 ? "0" + month : month;

  const year = date.getFullYear();
  const dte = day + "/" + month + "/" + year;

  return [dte, String(getTime())];
}

export function getDoW(movieDate, date) {
  if (!date.localeCompare(movieDate)) {
    return "Today" + " - " + movieDate;
  }
  const parts = movieDate.split("/");
  const d = new Date(parts[2], parts[1] - 1, parts[0]);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return dayNames[d.getDay()] + " - " + movieDate;
}

export const checkDates = (movieDate, todaysDate) => {
  let parts1 = movieDate.split("/");
  let dt1 = new Date(parseInt(parts1[2], 10), parseInt(parts1[1], 10) - 1, parseInt(parts1[0], 10));
  let parts2 = todaysDate.split("/");
  let dt2 = new Date(parseInt(parts2[2], 10), parseInt(parts2[1], 10) - 1, parseInt(parts2[0], 10));
  return dt1 >= dt2;
};

export function getTime() {
  return new Date().toTimeString().substring(0, 5);
}

export const getYesterdaysDate = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  let day = yesterday.getDate();
  if (day < 10) day = "0" + day;
  let month = yesterday.getMonth() + 1;
  if (month < 10) month = "0" + month;
  let year = yesterday.getFullYear();
  return day + "/" + month + "/" + year;
};

export const getChannelImage = (channelName) => {
  const svgDir = require.context("./assets/channel_logos_svg/");
  switch (channelName) {
    case "Nine":
      return svgDir(`./nine.svg`);
    case "9":
      return svgDir(`./nine.svg`);
    case "9HD":
      return svgDir(`./9hd.svg`);
    case "Seven":
      return svgDir(`./seven.svg`);
    case "7":
      return svgDir(`./seven.svg`);
    case "7HD":
      return svgDir(`./7hd.svg`);
    case "Ten":
      return svgDir(`./ten.svg`);
    case "10":
      return svgDir(`./ten.svg`);
    case "10 HD":
      return svgDir(`./10hd.svg`);
    case "10HD":
      return svgDir(`./10hd.svg`);
    case "10 BOLD":
      return svgDir(`./10bold.svg`);
    case "10 Peach":
      return svgDir(`./10peach.svg`);
    case "10 SHAKE":
      return svgDir(`./10shake.svg`);
    case "ABC":
      return svgDir(`./abc.svg`);
    case "ABC Kids Listen":
      return svgDir(`./abckidslisten.svg`);
    case "ABC Classic":
      return svgDir(`./abcclassic.svg`);
    case "ABC Jazz":
      return svgDir(`./abcjazz.svg`);
    case "ABC TV":
      return svgDir(`./abctv.svg`);
    case "ABC TV HD":
      return svgDir(`./abctvhd.svg`);
    case "ABC Kids/ABC TV Plus":
      return svgDir(`./abckids.svg`);
    case "ABC ME":
      return svgDir(`./abcme.svg`);
    case "ABC NEWS":
      return svgDir(`./abcnews.svg`);
    case "ABC Radio National":
      return svgDir(`./abcrn.svg`);
    case "SBS":
      return svgDir(`./sbs.svg`);
    case "SBS Chill":
      return svgDir(`./sbschill.svg`);
    case "SBS Arabic24":
      return svgDir(`./sbsarabic.svg`);
    case "SBS Radio 1":
      return svgDir(`./sbsradio.svg`);
    case "SBS Radio 2":
      return svgDir(`./sbsradio.svg`);
    case "SBS Radio 3":
      return svgDir(`./sbsradio.svg`);
    case "SBS PopAsia":
      return svgDir(`./sbspopasia.svg`);
    case "SBS PopDesi":
      return svgDir(`./sbspopdesi.svg`);
    case "SBS HD":
      return svgDir(`./sbshd.svg`);
    case "SBS Food":
      return svgDir(`./sbsfood.svg`);
    case "SBS VICELAND":
      return svgDir(`./sbsviceland.svg`);
    case "SBS VICELAND HD":
      return svgDir(`./sbsvicehd.svg`);
    case "SBS World Movies":
      return svgDir(`./sbsworldmovies.svg`);
    case "9Rush":
      return svgDir(`./9rush.svg`);
    case "9Life":
      return svgDir(`./9life.svg`);
    case "9Gem":
      return svgDir(`./9gem.svg`);
    case "9GEM":
      return svgDir(`./9gem.svg`);
    case "GEM":
      return svgDir(`./9gem.svg`);
    case "9Gem HD":
      return svgDir(`./9gemhd.svg`);
    case "9GEMHD":
      return svgDir(`./9gemhd.svg`);
    case "GO!":
      return svgDir(`./9go.svg`);
    case "9Go!":
      return svgDir(`./9go.svg`);
    case "9GO!":
      return svgDir(`./9go.svg`);
    case "7TWO":
      return svgDir(`./7two.svg`);
    case "7TWO Prime":
      return svgDir(`./7two.svg`);
    case "7mate":
      return svgDir(`./7mate.svg`);
    case "7mate HD":
      return svgDir(`./7matehd.svg`);
    case "7mate Prime":
      return svgDir(`./7mate.svg`);
    case "GWN7mate":
      return svgDir(`./7mate.svg`);
    case "GWN7TWO":
      return svgDir(`./7two.svg`);
    case "GWN7":
      return svgDir(`./seven.svg`);
    case "7flix":
      return svgDir(`./7flix.svg`);
    case "7flix Prime":
      return svgDir(`./7flix.svg`);
    case "TVSN":
      return svgDir(`./tvsn.svg`);
    case "NITV":
      return svgDir(`./nitv.svg`);
    case "Openshop":
      return svgDir(`./openshop.svg`);
    case "RACING.COM":
      return svgDir(`./racing.svg`);
    case "Triple J":
      return svgDir(`./triplej.svg`);
    case "Double J":
      return svgDir(`./doublej.svg`);
    case "Extra":
      return svgDir(`./extra.svg`);
    case "Sky News Regional":
      return svgDir(`./skynewsregional.svg`);
    case "ishoptv":
      return svgDir(`./ishoptv.svg`);
    case "SBN":
      return svgDir(`./sbn.svg`);
    case "Aspire":
      return svgDir(`./aspire.svg`);
    case "SpreeTV":
      return svgDir(`./spreetv.svg`);
  }
};
