import type { Level } from "../types";

export interface Starter {
  title: string;
  composer: string;
  note: string;
}

/**
 * A few widely used starting points, so a new player is not staring at an empty
 * repertoire list. Anything here can be deleted.
 */
export const STARTERS: Record<Level, Starter[]> = {
  beginner: [
    { title: "Lección 1 (from Método, Book 1)", composer: "Julio Sagreras", note: "Reading and first arpeggios" },
    { title: "Estudio in C, op. 60 no. 1", composer: "Matteo Carcassi", note: "Right-hand stability" },
    { title: "Andantino in C", composer: "Matteo Carcassi", note: "Melody over bass" },
    { title: "Estudio in A minor", composer: "Dionisio Aguado", note: "Free-stroke tone" },
    { title: "Greensleeves (arr. for guitar)", composer: "Traditional", note: "Phrasing and memory" },
  ],
  intermediate: [
    { title: "Estudio in B minor, op. 35 no. 22", composer: "Fernando Sor", note: "Texture and balance" },
    { title: "Estudio in A, op. 60 no. 7", composer: "Matteo Carcassi", note: "Barre work" },
    { title: "Estudio in E minor", composer: "Francisco Tárrega", note: "Tone and legato" },
    { title: "Estudios Sencillos no. 6", composer: "Leo Brouwer", note: "Independence" },
    { title: "Lagrima", composer: "Francisco Tárrega", note: "Phrasing and memory" },
    { title: "Prelude in D minor, BWV 999", composer: "J. S. Bach", note: "Arpeggios at tempo" },
  ],
  advanced: [
    { title: "Etude no. 1", composer: "Heitor Villa-Lobos", note: "Arpeggios and stamina" },
    { title: "Etude no. 11", composer: "Heitor Villa-Lobos", note: "Independence and speed" },
    { title: "Prelude, Fugue and Allegro, BWV 998", composer: "J. S. Bach", note: "Texture and memory" },
    { title: "Asturias (Leyenda)", composer: "Isaac Albéniz", note: "Barre and tremolo-like repetition" },
    { title: "Recuerdos de la Alhambra", composer: "Francisco Tárrega", note: "Tremolo" },
    { title: "El testament d'Amèlia", composer: "Miguel Llobet", note: "Phrasing and colour" },
  ],
  conservatoire: [
    { title: "Sonata, op. 47 (Homage to Boccherini)", composer: "Antonio José", note: "Programme centrepiece" },
    { title: "Invocation et Danse", composer: "Joaquín Rodrigo", note: "Colour and memory" },
    { title: "Nocturnal after John Dowland, op. 70", composer: "Benjamin Britten", note: "Structure and concentration" },
    { title: "Capricho Árabe", composer: "Francisco Tárrega", note: "Maintenance and rubato" },
    { title: "Un Sueño en la Floresta", composer: "Agustín Barrios", note: "Tremolo under load" },
  ],
};
