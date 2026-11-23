import Intro from "@/components/Intro";
import App from "@/components/App";
import CommandCenter from "@/components/CommandCenter";
import Cursor from "@/components/Cursor";
import PwaManager from "@/components/PwaManager";
import { ContentProvider } from "@/components/ContentProvider";

export default function Home() {
  return (
    <ContentProvider>
    <main>
      <App />
      <Intro />
      <CommandCenter />
      <Cursor />
      <PwaManager />
    </main>
    </ContentProvider>
  );
}
