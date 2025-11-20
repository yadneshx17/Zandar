import { db } from "../services/db/schema.js";
import { useLiveQuery } from 'dexie-react-hooks'

function LinkList() {
    const links = useLiveQuery(() => db.links.toArray());
  
    return (
      <ul>
        {links?.map((link) => (
          <li key={link.id}>
            {link.name}, {link.link}
          </li>
        ))}
      </ul>
    );
}

export default LinkList