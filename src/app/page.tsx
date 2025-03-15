import styles from "./page.module.css";
import { GPXReader } from "@/components/GPXReader";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <GPXReader />
      </main>
    </div>
  );
}
