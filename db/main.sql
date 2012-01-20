DROP TABLE IF EXISTS "Comment";
CREATE TABLE "Comment" (
	 "id" text NOT NULL,
	 "comment" text,
	 "user_id" text,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "Comment_Assoc";
CREATE TABLE "Comment_Assoc" (
	 "id" text NOT NULL,
	 "comment_id" text NOT NULL,
	 "item_id" text NOT NULL,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "File";
CREATE TABLE "File" (
	 "id" text NOT NULL,
	 "name" text,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "File_Assoc";
CREATE TABLE "File_Assoc" (
	 "id" text NOT NULL,
	 "file_id" text NOT NULL,
	 "item_id" text NOT NULL,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "Folder";
CREATE TABLE "Folder" (
	 "id" text NOT NULL,
	 "name" text,
	 "description" text,
	 "start" integer,
	 "end" integer,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "Priority";
CREATE TABLE "Priority" (
	 "id" text NOT NULL,
	 "name" text,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "State";
CREATE TABLE "State" (
	 "id" text NOT NULL,
	 "name" text,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "Task";
CREATE TABLE "Task" (
	 "id" text NOT NULL,
	 "name" text,
	 "description" text,
	 "start" integer,
	 "end" integer,
	 "estimate" real,
	 "state_id" text,
	 "priority_id" text,
	 "project_id" text,
	 "type_id" text,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "Type";
CREATE TABLE "Type" (
	 "id" text NOT NULL,
	 "name" text,
	PRIMARY KEY("id")
);

DROP TABLE IF EXISTS "User";
CREATE TABLE "User" (
	 "id" text NOT NULL,
	 "first_name" text,
	 "last_name" text,
	 "login" text,
	 "password" text,
	PRIMARY KEY("id")
);