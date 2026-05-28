import { Badge } from '@/components/ui/badge'
import { getLicenseBadgeColors } from '@/helpers/licenses/license-colors'

type LicenseBadgeProps = {
  license: string
}

export function LicenseBadge({ license }: LicenseBadgeProps) {
  const colors = getLicenseBadgeColors(license)
  const displayLicense = license.toUpperCase()

  return (
    <Badge
      variant="outline"
      className="max-w-full rounded-md align-middle"
      style={{
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        color: colors.color,
      }}
    >
      <span className="break-all">{displayLicense}</span>
    </Badge>
  )
}
