SELECT
  usr.id as "applicantId",
  usr.fullname as "applicantName",
  eve.id as "eventId",
  eve.name as "eventName",
  pos.id as "positionId",
  pos.name as "positionName",
  usr.gender as "gender",
  application.id as "applicationId",
  application."timeCreated" as "appliedAt",
  application.status as "status"
FROM
  "Application" as application
    JOIN(
      SELECT
        usr.id as id,
        usr.fullname as fullname,
        usr.gender as gender
      FROM
        "User" as usr
    ) AS usr ON usr.id = application."userId"
    JOIN (
      SELECT
        pos.id as id,
        pos.name as name,
        pos."eventId" as eve_id
      FROM
        "Position" as pos
    ) AS pos ON pos.id = application."positionId"
    JOIN (
      SELECT
        eve.id as id,
        eve.name as name,
        eve."organizationId" as org_id
      FROM
        "Event" as eve
    ) AS eve ON pos.eve_id = eve.id
    JOIN (
      SELECT
        org.id as id
      FROM
        "Organization" as org
    ) AS org ON eve.org_id = org.id
WHERE
  org.id = 1
  AND usr.gender = 'MALE'
  AND (
    (usr.fullname || eve.name || pos.name) ILIKE '%%'
  )
  ORDER BY "appliedAt" DESC;