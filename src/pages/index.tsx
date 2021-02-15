import { useRouter } from "next/router";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/hire");
  }, []);

  return (
    <div className="container">
      <div>
        <h1>Harry's Hot Tubs</h1>
        <button onClick={(e) => router.push("/hire")}>Hire a Hot Tub</button>
      </div>
      <div className="lozenge" />
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer in
          nulla aliquet libero lacinia hendrerit id nec metus. Quisque gravida.
        </p>
      </div>
    </div>
  );
};

export default Home;
