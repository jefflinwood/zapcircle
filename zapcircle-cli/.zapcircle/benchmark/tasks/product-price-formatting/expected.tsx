export function Product({ name, price }) {
  const formattedPrice = `$${price.toFixed(2)}`;
  return (
    <div className="product">
      <span>{name}</span>
      <span style={{ textAlign: "right", display: "inline-block", width: "100px" }}>{formattedPrice}</span>
    </div>
  );
}