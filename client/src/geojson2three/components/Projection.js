function Projection(offset) {
  return function (coords) {
    return [(coords[0] / 180) * offset, (coords[1] / 180) * offset];
  };
}

export default Projection;

