/*
 Navicat SQLite Data Transfer

 Source Server         : timtrak
 Source Server Version : 3007006
 Source Database       : main

 Target Server Version : 3007006
 File Encoding         : utf-8

 Date: 01/18/2012 11:22:15 AM
*/

PRAGMA foreign_keys = false;

-- ----------------------------
--  Table structure for "Comment"
-- ----------------------------
DROP TABLE IF EXISTS "Comment";
CREATE TABLE "Comment" (
	 "id" text NOT NULL,
	 "comment" text,
	 "user_id" text,
	PRIMARY KEY("id")
);

-- ----------------------------
--  Table structure for "Comment_Assoc"
-- ----------------------------
DROP TABLE IF EXISTS "Comment_Assoc";
CREATE TABLE "Comment_Assoc" (
	 "id" text NOT NULL,
	 "comment_id" text NOT NULL,
	 "item_id" text NOT NULL,
	PRIMARY KEY("id")
);

-- ----------------------------
--  Table structure for "File"
-- ----------------------------
DROP TABLE IF EXISTS "File";
CREATE TABLE "File" (
	 "id" text NOT NULL,
	 "name" text,
	PRIMARY KEY("id")
);

-- ----------------------------
--  Table structure for "File_Assoc"
-- ----------------------------
DROP TABLE IF EXISTS "File_Assoc";
CREATE TABLE "File_Assoc" (
	 "id" text NOT NULL,
	 "file_id" text NOT NULL,
	 "item_id" text NOT NULL,
	PRIMARY KEY("id")
);

-- ----------------------------
--  Table structure for "Folder"
-- ----------------------------
DROP TABLE IF EXISTS "Folder";
CREATE TABLE "Folder" (
	 "id" text NOT NULL,
	 "name" text,
	 "description" text,
	 "start" integer,
	 "end" integer,
	PRIMARY KEY("id")
);

-- ----------------------------
--  Table structure for "Priority"
-- ----------------------------
DROP TABLE IF EXISTS "Priority";
CREATE TABLE "Priority" (
	 "id" text NOT NULL,
	 "name" text,
	PRIMARY KEY("id")
);

-- ----------------------------
--  Table structure for "State"
-- ----------------------------
DROP TABLE IF EXISTS "State";
CREATE TABLE "State" (
	 "id" text NOT NULL,
	 "name" text,
	PRIMARY KEY("id")
);

-- ----------------------------
--  Table structure for "Task"
-- ----------------------------
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

-- ----------------------------
--  Table structure for "Type"
-- ----------------------------
DROP TABLE IF EXISTS "Type";
CREATE TABLE "Type" (
	 "id" text NOT NULL,
	 "name" text,
	PRIMARY KEY("id")
);

-- ----------------------------
--  Table structure for "User"
-- ----------------------------
DROP TABLE IF EXISTS "User";
CREATE TABLE "User" (
	 "id" text NOT NULL,
	 "first_name" text,
	 "last_name" text,
	 "login" text,
	 "password" text,
	PRIMARY KEY("id")
);

PRAGMA foreign_keys = true;
