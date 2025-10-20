import type { Supplier } from "../types/Supplier";
import "./SortMenu.css"

type SortMenuProps = {
  data: Supplier[];
  onSorted: (sorted: Supplier[]) => void;
};


const SortMenu = ({ data, onSorted }: SortMenuProps) => {
  const handleChange = (value: string) => {
    const sorted = [...data].sort((a, b) => {
      switch (value) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        // case "date-newest":
        //   return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // case "date-oldest":
        //   return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    onSorted(sorted);
  };

  return (
    <div className="sort-menu">
      <select
        id="sort"
        onChange={(e) => handleChange(e.target.value)}

      >
        <option value="" disabled>
    Sortiraj
  </option>
        <option value="name-asc">Naziv (A-Z)</option>
        <option value="name-desc">Naziv (Z-A)</option>
        <option value="date-newest">Najnovije</option>
        <option value="date-oldest">Najstarije</option>
      </select>
    </div>
  );
};



export default SortMenu;
