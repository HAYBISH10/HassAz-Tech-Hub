import { useEffect, useState } from "react";
import { catalog as fallbackCatalog, flattenPrograms } from "../data/catalog";
import { site as fallbackSite } from "../data/site";
import { fetchCatalog, fetchCourses, fetchSite } from "../services/api";

export function useSite() {
  const [data, setData] = useState(fallbackSite);

  useEffect(() => {
    fetchSite().then(setData);
  }, []);

  return data;
}

function withImages(list) {
  const bySlug = Object.fromEntries(fallbackCatalog.map((item) => [item.slug, item]));
  return (list || []).map((category) => {
    const local = bySlug[category.slug];
    return {
      ...category,
      image: category.image || local?.image,
      programs: (category.programs || []).map((program) => {
        const localProgram = local?.programs.find((item) => item.slug === program.slug);
        return {
          ...program,
          image: program.image || localProgram?.image || local?.image,
        };
      }),
    };
  });
}

export function useCatalog() {
  const [data, setData] = useState(fallbackCatalog);

  useEffect(() => {
    fetchCatalog().then((remote) => setData(withImages(remote)));
  }, []);

  return data;
}

export function useCourses() {
  const [data, setData] = useState(flattenPrograms(fallbackCatalog));

  useEffect(() => {
    fetchCourses().then(setData);
  }, []);

  return data;
}
