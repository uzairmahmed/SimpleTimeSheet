import UserList from "../components/user/UserList";
import type { User } from "../types/user";

const Home: React.FC = () => {

  const dummyUsers: User[] = [
    {
      id: 1,
      username: "gurpreet.bhamrah",
      active: true,
      first_name: "Gurpreet",
      last_name: "Bhamrah",
      pay: 21,
      notes: "",
    },
    {
      id: 2,
      username: "carolina.meija",
      active: true,
      first_name: "Carolina",
      last_name: "Meija",
      pay: 22,
      notes: "",
    },
    {
      id: 3,
      username: "syeda.ali",
      active: true,
      first_name: "Syeda",
      last_name: "Ali",
      pay: 21,
      notes: "123",
    },
    {
      id: 4,
      username: "uzair.ahmed",
      active: true,
      first_name: "Uzair",
      last_name: "Ahmed",
      pay: 21,
      notes: "asd",
    },
    {
      id: 5,
      username: "shiza.ahmed",
      active: false,
      first_name: "Shiza",
      last_name: "Ahmed",
      pay: 21,
      notes: "",
    },
    { 
      id: 6,
      username: "syed.hussain",
      active: false,
      first_name: "Syed",
      last_name: "Hussain",
      pay: 44,
      notes: "",
    },
    {
      id: 7,
      username: "fadi.matloub",
      active: false,
      first_name: "Fadi",
      last_name: "Matloub",
      pay: 21,
      notes: "",
    },
    {
      id: 8,
      username: "hina.ahmar",
      active: true,
      first_name: "Hina",
      last_name: "Ahmar",
      pay: 21,
      notes: "",
    },
    {
      id: 9,
      username: "samreen.ali",
      active: false,
      first_name: "Samreen",
      last_name: "Ali",
      pay: 21,
      notes: "",
    },
    { 
      id: 10,
      username: "uzma.jatoi",
      active: true,
      first_name: "Uzma",
      last_name: "Jatoi",
      pay: 21,
      notes: "",
    },
    {
      id: 11,
      username: "aqleema.rehman",
      active: false,
      first_name: "Aqleema",
      last_name: "Rehman",
      pay: 21,
      notes: "",
    },
    {
      id: 12,
      username: "keysa.fatima",
      active: true,
      first_name: "Keysa",
      last_name: "Fatima",
      pay: 21,
      notes: "",
    },
    {
      id: 13,
      username: "um.e.rubab",
      active: false,
      first_name: "Um E",
      last_name: "Rubab",
      pay: 21,
      notes: "",
    },
    {
      id: 14,
      username: "aiman.sohail",
      active: false,
      first_name: "Aiman",
      last_name: "Sohail",
      pay: 21,
      notes: "",
    },
  ];

  return (
    <UserList users={dummyUsers} />
  );
};

export default Home;
