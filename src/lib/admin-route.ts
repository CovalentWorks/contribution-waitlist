// Runtime-only configuration: never publish the actual path in source or NEXT_PUBLIC_ variables.
export function isAdminPath(segment: string): boolean {
 const configured = process.env.ADMIN_PATH;
 return !!configured && /^admin-[0-9]{24}$/.test(configured) && segment === configured;
}
