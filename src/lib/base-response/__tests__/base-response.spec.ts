import { Either, right } from 'fp-ts/Either';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';

import { BaseEntityResponse } from '../base-entity-response';
import { BaseResponse } from '../base-response';

describe('BaseResponse', () => {
  interface ITag {
    id: number;
    text: string;
    createdAt: number;
    updatedAt: number;
  }

  interface IPost {
    title: string;
    tags: Array<ITag>;
  }

  class TagResponse extends BaseEntityResponse<ITag> {
    text: string;
  }

  class PostResponse extends BaseEntityResponse<IPost> {
    title: string;
    tags: Array<TagResponse>;

    constructor(post: IPost) {
      super(post);
      this.tags = TagResponse.fromArray(post.tags) as Array<TagResponse>;
    }
  }

  it('should all values from passed object', () => {
    const tag: ITag = {
      id: 1,
      text: 'tag',
      createdAt: 0,
      updatedAt: 0,
    };

    const tagResponse = new TagResponse(tag);

    expect(tagResponse).toEqual(tag);
    expect(tagResponse).toBeInstanceOf(TagResponse);
  });

  it('should return array of TagResponse from array of ITag', () => {
    const tags: Array<ITag> = [
      {
        id: 1,
        text: 'tag',
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 2,
        text: 'tag2',
        createdAt: 0,
        updatedAt: 0,
      },
    ];

    const tagResponses = TagResponse.fromArray(tags);

    expect(tagResponses).toHaveLength(2);

    expect(tagResponses[0]).toEqual(tags[0]);
    expect(tagResponses[0]).toBeInstanceOf(TagResponse);

    expect(tagResponses[1]).toEqual(tags[1]);
  });

  it('should work with request array as argument', () => {
    const tags: Array<ITag> = [
      {
        id: 1,
        text: 'tag',
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 2,
        text: 'tag2',
        createdAt: 0,
        updatedAt: 0,
      },
    ];

    const post = {
      title: 'post',
      tags,
    };

    const postResponse = new PostResponse(post);

    expect(postResponse).toEqual(post);
    expect(postResponse).toBeInstanceOf(PostResponse);
    expect(postResponse.tags[0]).toBeInstanceOf(TagResponse);
    expect(postResponse.tags).toHaveLength(2);
  });

  it('should work with either via fromEither', () => {
    const _tag = {
      id: 1,
      text: 'tag',
      createdAt: 0,
      updatedAt: 0,
    };
    const tag: Either<never, ITag> = right(_tag);

    const tagResponse = TagResponse.fromEither(tag);

    expect(tagResponse).toBeInstanceOf(TagResponse);
    expect(tagResponse).toEqual(_tag);
  });

  it('should work with taskEither via fromTaskEither', async () => {
    const _tag = {
      id: 1,
      text: 'tag',
      createdAt: 0,
      updatedAt: 0,
    };
    const tag: TE.TaskEither<never, ITag> = TE.right(_tag);

    const tagResponse = await TagResponse.fromTaskEither(tag);

    expect(tagResponse).toBeInstanceOf(TagResponse);
    expect(tagResponse).toEqual(_tag);
  });

  it('should transform partial task either to object with data properties', async () => {
    const tags = [
      {
        id: 1,
        text: 'first_tag',
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 2,
        text: 'second_tag',
        createdAt: 0,
        updatedAt: 0,
      },
      {
        id: 3,
        text: 'third_tag',
        createdAt: 0,
        updatedAt: 0,
      },
    ];

    const [first, second, third] = tags;

    const response = await BaseResponse.fromPartialTaskEither({
      first,
      second: E.right(second),
      third: TE.right(third),
    });

    expect(response).toEqual({
      first,
      second,
      third,
    });
  });
});
