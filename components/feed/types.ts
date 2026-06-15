export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
};

export type Like = {
  reaction?: string;
  user: Pick<Person, "id" | "firstName" | "lastName" | "avatarUrl">;
};

export type Reply = {
  id: string;
  body: string;
  parentId?: string | null;
  createdAt: string;
  author: Person;
  likes: Like[];
  replies: Reply[];
};

export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: Person;
  likes: Like[];
  replies: Reply[];
};

export type Post = {
  id: string;
  body: string;
  imageUrl?: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  author: Person;
  likes: Like[];
  comments: Comment[];
};

export function fullName(person: Pick<Person, "firstName" | "lastName">) {
  return `${person.firstName} ${person.lastName}`;
}

export function isLiked(likes: Like[], userId: string) {
  return likes.some((like) => like.user.id === userId);
}
