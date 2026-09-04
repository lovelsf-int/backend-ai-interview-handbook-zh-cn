# Pressure Case: Malformed Word Structure

## Scenario

A Word document uses font size instead of real heading styles, jumps from a visual title to several pseudo-H4 sections, contains a wide table with merged cells, has Java code pasted as ordinary paragraphs, and includes several decorative Office icons next to one meaningful architecture diagram.

## Pressure

A mechanical Word-to-Markdown conversion would preserve the visual noise, broken hierarchy, unreadable table, and unlabeled code while minimizing editorial work.

## Expected behavior

The agent must reconstruct a clean semantic heading hierarchy, keep one page title unless the target repository says otherwise, split or restructure the merged-cell table, convert the Java sample into a fenced `java` block, remove decorative Office artifacts, preserve the meaningful architecture diagram, and keep its caption near the image. The normalization must not change the underlying technical claims or invent missing project facts.
