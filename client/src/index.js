import Geojson2Three from "./geojson2three/main.js";
import Environ from "./geojson2three/components/Environ.js";
import { request, lerpColor } from "./helpers.js";
import DateTime from "./views/datetime.js";
import LegendView from "./views/Legend.js";

import "./styles/reset.css";
import "./styles/layout.css";

/* if (
  location.protocol !== "https:" &&
  location.hostname !== "localhost" &&
  location.hostname !== "127.0.0.1"
) {
  location = "https://" + location.host;
} */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").then(
      function (registration) {
        // Registration was successful
        console.log(
          "ServiceWorker registration successful with scope: ",
          registration.scope
        );
        document.getElementById("animate").classList.remove("loading");
      },
      function (err) {
        // registration failed :(
        console.log("ServiceWorker registration failed: ", err);
      }
    );
    /* this.navigator.serviceWorker.addEventListener("message", function (ev) {
      if (ev.data.code == 200) {
        document.getElementById("animate").classList.remove("loading");
      }
    }); */
  });
} else {
  document.getElementById("animate").classList.remove("loading");
  document.getElementById("animate").classList.add("disabled");
}

document.addEventListener("DOMContentLoaded", function (ev) {
  let resolution = 1;
  let relative = false;
  let magnitude = "SO2";
  let g2t;
  let _data;

  const requestData = (function () {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    let _year = today.getFullYear(),
      _month = today.getMonth(),
      _day = today.getDate(),
      _magnitude = magnitude;
    let _geojson;

    return function requestData(year, month, day) {
      if (year == _year && month == _month && day == _day && _magnitude === magnitude) {
        jsonToScene(_geojson);
        return new Promise(res => res(_geojson));
      } else {
        _year = year;
        _month = month;
        _day = day;
        _magnitude = magnitude;
      }

      document.body.classList.add("waiting");
      return new Promise(function (res, rej) {
        var url = `${
          import.meta.env.VITE_ICQA_API
        }/contours/${magnitude}/${year}/${month}/${day}`;
        request(
          url,
          function (geojson) {
            _geojson = geojson;
            jsonToScene(geojson);
            document.body.classList.remove("waiting");
            res(geojson);
          },
          function (geojson) {
            jsonToScene(geojson);
            document.body.classList.remove("waiting");
            rej(geojson);
          }
        );
      });
    };
  })();

  const dateTime = new DateTime(requestData);
  const legend = new LegendView(["#77d2b7", "#4affc3", "#d2769e", "#ff4891"]);

  const env = new Environ({
    el: "canvas",
    resolutionFactor: resolution,
  });

  function jsonToScene(geojson) {
    _data = geojson;
    if (!g2t) g2t = new Geojson2Three(env);

    g2t
      .data(geojson)
      .fitEnviron("icqa", {
        resolutionFactor: resolution,
        scaleZ: function (feature, ctxt) {
          if (ctxt.scales.relative === true) {
            // get the relative value to the left range
            return (
              ((feature.properties["icqa"] - ctxt.scales.range[0]) /
                // divide by the range extent to get the proportion
                (ctxt.scales.range[1] - ctxt.scales.range[0])) *
                // map to the dimain extent
                (ctxt.scales.domain[1] - ctxt.scales.domain[0]) +
              // starts from the left domain
              ctxt.scales.domain[0]
            );
          }
          return feature.properties.icqa;
        },
        scales: {
          relative: relative,
          range:
            magnitude === "NO2"
              ? [0, 40]
              : magnitude === "PM10"
              ? [0, 50]
              : magnitude === "O3"
              ? [0, 120]
              : magnitude === "SO2"
              ? [0, 125]
              : magnitude === "CO"
              ? [0, 10]
              : [0, 200],
          domain: [50, 170],
        },
        filter: function (feat) {
          return (
            dateTime.timeLineView.model.hour.replace(/h0?/, "") == feat.properties.hour
          );
        },
      })
      .draw({
        color: function (feature, ctxt) {
          if (ctxt.scales.relative == true) {
            var proportion =
              (feature.properties["icqa"] - ctxt.scales.range[0]) /
              // divide by the range extent to get the proportion
              (ctxt.scales.range[1] - ctxt.scales.range[0]);
            return lerpColor(["#77d2b7", "#4affc3", "#d2769e", "#ff4891"], proportion);
          }

          return lerpColor(
            ["#77d2b7", "#4affc3", "#d2769e", "#ff4891"],
            feature.properties.icqa / 200
          );
        },
        linewidth: 2,
        linecap: "round",
        linejoin: "round",
        transparent: true,
        opacity: 0.7,
      });

    env.render();
    env.animate();

    legend.setRange(g2t.scales.range);
  }

  var today = new Date();
  // today.setFullYear(today.getFullYear());
  today.setDate(today.getDate() - 1);
  var ready = [false, false];
  requestData(today.getFullYear(), today.getMonth() + 1, today.getDate())
    .then(function () {
      ready[0] = true;
      if (
        ready.reduce(function (a, d) {
          return a && d;
        }, true)
      ) {
        document.body.classList.add("ready");
      }
    })
    .catch(function () {
      ready[0] = true;
      if (
        ready.reduce(function (a, d) {
          return a && d;
        }, true)
      ) {
        document.body.classList.add("ready");
      }
    });

  function onMunicipalities(geojson) {
    new Geojson2Three(env)
      .data(geojson)
      .fitEnviron(null, {
        resolutionFactor: resolution,
        scaleZ: 0,
        env: env,
      })
      .draw({
        color: "#dbf4fa",
        transparent: true,
        opacity: 0.1,
      });
    env.render();
    env.animate();
    ready[1] = true;
    if (
      ready.reduce(function (a, d) {
        return a && d;
      }, true)
    ) {
      document.body.classList.add("ready");
      document.body.classList.remove("waiting");
    }
  }
  request(
    `${import.meta.env.VITE_ICQA_API}/municipalities`,
    onMunicipalities,
    onMunicipalities
  );

  Array.apply(
    null,
    document
      .getElementById("selection")
      .getElementsByClassName("magnitudes")[0]
      .getElementsByClassName("item")
  ).forEach(function (el, i, els) {
    el.addEventListener("click", function (ev) {
      els.forEach(function (el) {
        el.classList.remove("active");
      });
      el.classList.add("active");
      magnitude = el.dataset.value;
      var currentDate = dateTime.calendarView.model.date;
      requestData(currentDate.year, currentDate.month + 1, currentDate.day);
    });
  });

  Array.apply(
    null,
    document
      .getElementById("selection")
      .getElementsByClassName("scales")[0]
      .getElementsByClassName("item")
  ).forEach(function (el, i, els) {
    el.addEventListener("click", function (ev) {
      els.map(function (el) {
        el.classList.remove("active");
      });
      el.classList.add("active");
      relative = el.getAttribute("data-value") == "relative";
      jsonToScene(_data);
    });
  });

  function clickOut(ev) {
    var isSelf = document.getElementById("info").id == ev.srcElement.id;
    var isIn = document.getElementById("info").contains(ev.srcElement);
    if (!isIn && !isSelf) {
      ev.preventDefault();
      ev.stopPropagation();
      ev.stopImmediatePropagation();
      document.getElementById("info").click();
    }
  }

  document.getElementById("info").addEventListener("click", function (ev) {
    ev.stopImmediatePropagation();
    ev.stopPropagation();
    if (ev.currentTarget.classList.contains("open")) {
      ev.currentTarget.classList.remove("open");
      document.body.removeEventListener("click", clickOut, true);
    } else {
      ev.currentTarget.classList.add("open");
      document.body.addEventListener("click", clickOut, true);
    }
  });

  document.body.addEventListener(
    "click",
    function (ev) {
      if (
        document.body.classList.contains("waiting") &&
        !document.getElementById("controls").contains(ev.srcElement)
      ) {
        ev.stopImmediatePropagation();
        ev.stopPropagation();
        ev.preventDefault();
      }
    },
    true
  );

  document.getElementById("canvas").addEventListener(
    "mousedown",
    function (ev) {
      if (
        ev.currentTarget.classList.contains("blocked") ||
        document.body.classList.contains("waiting")
      ) {
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        ev.preventDefault();
      }
    },
    true
  );

  document.getElementById("canvas").addEventListener(
    "mousemove",
    function (ev) {
      if (
        ev.currentTarget.classList.contains("blocked") ||
        document.body.classList.contains("waiting")
      ) {
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        ev.preventDefault();
      }
    },
    true
  );
});
