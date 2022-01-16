interface BananasProps {
  amount: string | undefined;
}

export default function Bananas({ amount }: BananasProps) {
  return (
    <div className="Home-bananas">
      <h1>{amount ?? "?"} 🍌</h1>
    </div> 
  );
};
