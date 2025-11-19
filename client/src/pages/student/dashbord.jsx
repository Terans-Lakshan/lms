import { UserContext } from "../../context/userContext";
import { useContext } from "react";

const Dashboard = () => {
  const { user } = useContext(UserContext);

  return (
    <>
      <h1>Student Dashboard Page</h1>
      {!!user && user.role === "student" && <h1>Hi {user.name || "User"}</h1>}
      
    </>
  );
}

export default Dashboard;