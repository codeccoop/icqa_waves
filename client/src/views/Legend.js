export default (function () {
  function Legend(colors) {
    this.$el = document.getElementById("legend");
    this.colors = colors;
  }

  Legend.prototype.setRange = function setRange(range) {
    this.range = range;
    this.draw();
  };

  Legend.prototype.draw = function draw() {
    const $wrapper = this.$el.querySelector(".legend__wrapper");
    $wrapper.innerHTML = "";

    const $bar = document.createElement("div");
    $bar.classList.add("legend__bar");
    $bar.style.backgroundImage = `linear-gradient(to right, ${this.colors.join(",")})`;
    $wrapper.appendChild($bar);

    const $labels = document.createElement("p");
    $labels.classList.add("legend__labels");
    for (let val of this.range) {
      let $label = document.createElement("span");
      $label.innerText = val;
      $labels.appendChild($label);
    }

    $wrapper.appendChild($labels);
  };

  return Legend;
})();
