import UserCalendarView from "../components/user/UserCalendarView";
import { useParams } from "react-router-dom";


const User: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <UserCalendarView userId={id ?? "1"} />
  );
};

export default User;
