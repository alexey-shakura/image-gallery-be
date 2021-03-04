import { IImageDetails } from "../external-provider/types";
import { IMatchData } from "./types";

export class SearchEngineService {

  private readonly searchKeys: (keyof IImageDetails)[] = ['author', 'camera', 'tags'];

  public getMatches(data: IImageDetails[], searchTerm: string) {
    if (!searchTerm.length) {
      return data;
    }


    const matchesData: IMatchData[] = data
      .map((imageDetails) => {
        const score = this.getEntityScore(imageDetails, searchTerm)

        return { score, entity: imageDetails };
      })
      .filter(({ score }) => score > 0);

    return this.sortMatchesData(matchesData)
      .map(({ entity }) => entity);
  }

  private getEntityScore(imageDetails: IImageDetails, searchTerm: string): number {
    return this.searchKeys
      .filter((searchKey) => imageDetails[searchKey])
      .map((searchKey) => {
        const matches = imageDetails[searchKey]!.match(new RegExp(searchTerm, 'gi'));

        if (!matches) {
          return 0;
        }

        return matches.map((match) => match.length);
      })
      .flat()
      .reduce((prevValue, currValue) => prevValue + currValue, 0);
  }

  private sortMatchesData(value: IMatchData[]): IMatchData[] {
    return value.sort((leftMatch, rightMatch) => {
      if (leftMatch.score > rightMatch.score) {
        return -1;
      }

      if (leftMatch.score < rightMatch.score) {
        return 1;
      }

      return 0;
    });
  }

}
