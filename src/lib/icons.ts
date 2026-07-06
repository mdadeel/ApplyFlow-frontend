/**
 * Icon mapping — re-exports @phosphor-icons/react with lucide-react compatible names.
 * This allows a drop-in replacement: change `from 'lucide-react'` → `from '../../lib/icons'`.
 */
import * as P from '@phosphor-icons/react'
import type { ComponentType } from 'react'

export type LucideIcon = ComponentType<{ className?: string; size?: number | string }>

// ── Direct re-exports (same name in lucide and Phosphor) ──────────────────
export const Activity = P.Pulse
export const ArrowDown = P.ArrowDown
export const ArrowLeft = P.ArrowLeft
export const ArrowRight = P.ArrowRight
export const ArrowUp = P.ArrowUp
export const Award = P.Trophy
export const Bell = P.Bell
export const BookOpen = P.BookOpen
export const BrainCircuit = P.Brain
export const Briefcase = P.Briefcase
export const Bug = P.Bug
export const Building = P.Building
export const Calendar = P.Calendar
export const Check = P.Check
export const CheckCircle = P.CheckCircle
export const Clock = P.Clock
export const Code = P.Code
export const Copy = P.Copy
export const Download = P.Download
export const Eye = P.Eye
export const GitPullRequest = P.GitPullRequest
export const Globe = P.Globe
export const GraduationCap = P.GraduationCap
export const Highlighter = P.Highlighter
export const Info = P.Info
export const Key = P.Key
export const Keyboard = P.Keyboard
export const Lightbulb = P.Lightbulb
export const Link = P.Link
export const MapPin = P.MapPin
export const Pencil = P.Pencil
export const Plus = P.Plus
export const Shield = P.Shield
export const Star = P.Star
export const Target = P.Target
export const TrendingUp = P.TrendUp
export const Upload = P.Upload
export const User = P.User
export const X = P.X
export const XCircle = P.XCircle

// ── Renamed mappings (different name in Phosphor) ────────────────────────
export const AlertCircle = P.WarningCircle
export const AlertTriangle = P.Warning
export const BarChart3 = P.ChartBar
export const Bold = P.TextB
export const Building2 = P.Buildings
export const ChevronDown = P.CaretDown
export const ChevronLeft = P.CaretLeft
export const ChevronRight = P.CaretRight
export const ChevronUp = P.CaretUp
export const CircleHelp = P.Question
export const Code2 = P.Code
export const Edit3 = P.PencilLine
export const ExternalLink = P.ArrowSquareOut
export const EyeOff = P.EyeSlash
export const FileCheck = P.CheckCircle
export const FileCode = P.FileCode
export const FileSearch = P.ListMagnifyingGlass
export const FileSignature = P.Signature
export const FileSpreadsheet = P.FileXls
export const FileText = P.FileText
export const FileType = P.FileTxt
export const GripVertical = P.DotsSixVertical
export const Home = P.House
export const Italic = P.TextItalic
export const Layers = P.Stack
export const LayoutDashboard = P.SquaresFour
export const LayoutGrid = P.GridFour
export const LayoutList = P.List
export const List = P.ListBullets
export const ListChecks = P.ListChecks
export const Loader2 = P.CircleNotch
export const Mail = P.Envelope
export const Menu = P.ListDashes
export const MessageSquare = P.Chat
export const MoreHorizontal = P.DotsThree
export const RefreshCw = P.ArrowsClockwise
export const RotateCcw = P.ArrowCounterClockwise
export const RotateCw = P.ArrowClockwise
export const Save = P.FloppyDisk
export const ScrollText = P.Scroll
export const Search = P.MagnifyingGlass
export const Settings = P.Gear
export const Sparkles = P.Sparkle
export const Trash2 = P.Trash
export const Zap = P.Lightning
