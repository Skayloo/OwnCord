//go:build !windows

package admin

import "os/exec"

func setDetached(cmd *exec.Cmd) {
	// Not required for POSIX.
}
