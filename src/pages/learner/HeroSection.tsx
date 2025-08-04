// ts-client/src/pages/learner/HeroSection.tsx

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigate = useNavigate();

  const searchHandler = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      navigate(`/course/search?query=${searchQuery}`);
    }
    setSearchQuery("");
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="relative bg-gradient-to-r from-indigo-500 to bg-purple-700 dark:from-gray-800 dark:to-purple-900 py-24 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-4xl font-bold mb-4">
          Find The Best Courses for You
        </h1>
        <p className="text-gray-200 dark:text-gray-400 mb-8">
          Discover, Learn, and Upskill with our wide range of courses
        </p>

        <form
          onSubmit={searchHandler}
          className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-xl mx-auto mb-6"
        >
          <Input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search Courses"
            className="flex-grow border-none focus-visible:ring-0 px-6 py-3 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          />
          <Button
            type="submit"
            className="bg-purple-600 dark:bg-purple-700 text-white px-6 py-3 rounded-r-full hover:bg-purple-700 dark:hover:bg-purple-800"
          >
            Search
          </Button>
        </form>
        <Button
          onClick={() => navigate(`/course/search?query`)}
          className="bg-white dark:bg-gray-800 text-purple-600 rounded-full hover:bg-gray-200"
        >
          Explore Courses
        </Button>
      </div>
    </div>
  );
};

export default HeroSection;