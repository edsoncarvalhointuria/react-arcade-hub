import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { RankingItemType } from "../types/Ranking";
import type { GameList } from "../types/GameList";

// ----- Funções do LocalStorage -----

export function save(
    key: string,
    item: any,
    callback?: (this: any, key: string, value: any) => any
) {
    localStorage.setItem(key, JSON.stringify(item, callback));
}

export function load<T>(
    key: string,
    callback?: (this: any, key: string, value: any) => any
) {
    const result = localStorage.getItem(key);
    if (result) {
        const item: T = JSON.parse(result, callback);
        return item;
    }

    return null;
}

// ----- Funções do Firebase -----
export async function saveScoreFirebase(
    game: GameList,
    iniciais: string,
    pontos: number
) {
    const scoresRef = collection(db, "rankings", game, "scores");
    await addDoc(scoresRef, { iniciais, pontos } as RankingItemType);
}

export async function loadScoreFirebase(game: GameList) {
    const scoresRef = collection(db, "rankings", game, "scores");
    const q = query(scoresRef, orderBy("pontos", "desc"), limit(10));
    const querySnapshot = await getDocs(q);
    const arrayScore: RankingItemType[] = [];
    querySnapshot.forEach((v) => arrayScore.push(v.data() as RankingItemType));

    return arrayScore;
}
