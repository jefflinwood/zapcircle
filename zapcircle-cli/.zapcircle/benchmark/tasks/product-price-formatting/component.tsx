export function Product({ name, price }) {
  return (
    <div className="product">
      <span>{name}</span>
      <span>{price}</span>
    </div>
  );
}